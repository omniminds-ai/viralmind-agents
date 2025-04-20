const router: Router = express.Router();
import express, { Request, Response, Router } from 'express';
import { requireWalletAddress } from '../../middleware/auth.ts';
import multer from 'multer';
import { errorHandlerAsync } from '../../middleware/errorHandler.ts';
import { AWSS3Service } from '../../services/aws/index.ts';
import path from 'path';
import { copyFile, mkdir, stat, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import { Extract } from 'unzipper';
import { createHash } from 'crypto';
import { ApiError, ErrorCode, successResponse } from '../../middleware/types/errors.ts';
import { ForgeAppModel, ForgeRaceSubmission, TrainingPoolModel } from '../../models/Models.ts';
import { ForgeSubmissionProcessingStatus, UploadLimitType } from '../../types/index.ts';
import { addToProcessingQueue } from '../../services/forge/index.ts';
import { validateParams, ValidationRules } from '../../middleware/validator.ts';
export { router as forgeSubmissionsApi };

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 15 * 1024 * 1024 * 1024 // 15GB limit for /upload-race endpoint
  }
});

// Get submissions for authenticated user
router.get(
  '/user',
  requireWalletAddress,
  errorHandlerAsync(async (req: Request, res: Response) => {
    // @ts-ignore - Get walletAddress from the request object
    const address = req.walletAddress;

    const submissions = await ForgeRaceSubmission.find({ address })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(successResponse(submissions));
  })
);

// Get submissions for a pool
router.get(
  '/pool/:poolId',
  requireWalletAddress,
  validateParams({ poolId: { required: true, rules: [ValidationRules.isString()] } }),
  requireWalletAddress,
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { poolId } = req.params;

    // @ts-ignore - Get walletAddress from the request object
    const address = req.walletAddress;

    // Verify that the pool belongs to the user
    const pool = await TrainingPoolModel.findById(poolId);
    if (!pool) {
      throw ApiError.notFound('Pool not found');
    }

    if (pool.ownerAddress !== address) {
      throw ApiError.unauthorized('Not authorized to view submissions for this pool');
    }

    const submissions = await ForgeRaceSubmission.find({ 'meta.quest.pool_id': poolId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(successResponse(submissions));
  })
);

// Upload a new forge submission
router.post(
  '/upload',
  requireWalletAddress,
  upload.single('file'),
  errorHandlerAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      throw ApiError.badRequest('No file uploaded');
    }

    // @ts-ignore - Get walletAddress from the request object
    const address = req.walletAddress;

    try {
      const s3Service = new AWSS3Service(process.env.AWS_ACCESS_KEY, process.env.AWS_SECRET_KEY);

      // Create temporary directory for initial extraction
      const tempDir = path.join('uploads', `temp_${Date.now()}`);
      await mkdir(tempDir, { recursive: true });

      // Extract meta.json first to get ID
      await new Promise((resolve, reject) => {
        createReadStream(req.file!.path)
          .pipe(Extract({ path: tempDir }))
          .on('close', resolve)
          .on('error', reject);
      });

      // Read and parse meta.json
      const metaJson = await new Promise<string>((resolve, reject) => {
        let data = '';
        createReadStream(path.join(tempDir, 'meta.json'))
          .on('data', (chunk) => (data += chunk))
          .on('end', () => resolve(data))
          .on('error', reject);
      });
      const meta = JSON.parse(metaJson);

      // Create UUID from meta.id + address
      const uuid = createHash('sha256').update(`${meta.id}${address}`).digest('hex');

      // Create final directory with UUID
      const extractDir = path.join('uploads', `extract_${uuid}`);
      await mkdir(extractDir, { recursive: true });

      // Move files from temp to final directory
      const requiredFiles = ['input_log.jsonl', 'meta.json', 'recording.mp4'];
      for (const file of requiredFiles) {
        const tempPath = path.join(tempDir, file);
        const finalPath = path.join(extractDir, file);
        try {
          // Use fs.copyFile instead of pipe
          await copyFile(tempPath, finalPath);
        } catch (error) {
          await unlink(req.file.path);
          await unlink(tempDir).catch(() => {});
          throw ApiError.badRequest(`Missing required file: ${file}`);
        }
      }

      // Clean up temp directory
      await unlink(tempDir).catch(() => {});

      // Upload each file to S3
      const uploads = await Promise.all(
        requiredFiles.map(async (file) => {
          const filePath = path.join(extractDir, file);
          const fileStats = await stat(filePath);
          const s3Key = `forge-races/${Date.now()}-${file}`;

          await s3Service.saveItem({
            bucket: 'training-gym',
            file: filePath,
            name: s3Key
          });

          return { file, s3Key, size: fileStats.size };
        })
      );

      // Verify time if poolId and generatedTime provided
      if (meta.poolId && meta.generatedTime) {
        const now = Date.now();
        if (now - meta.generatedTime > 5 * 60 * 1000) {
          throw ApiError.forbidden('Generated time expired');
        }

        // Check upload limits
        const pool = await TrainingPoolModel.findById(meta.poolId);
        if (!pool) {
          throw ApiError.notFound('Pool not found');
        }

        // Check gym-wide upload limits
        if (pool.uploadLimit?.type) {
          let gymSubmissions;
          const poolId = pool._id.toString();

          switch (pool.uploadLimit.limitType) {
            case UploadLimitType.perDay:
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              gymSubmissions = await ForgeRaceSubmission.countDocuments({
                'meta.quest.pool_id': poolId,
                createdAt: { $gte: today },
                status: ForgeSubmissionProcessingStatus.COMPLETED, // Only count completed submissions
                reward: { $gt: 0 } // Only count submissions that received a reward
              });

              if (gymSubmissions >= pool.uploadLimit.type) {
                throw ApiError.forbidden('Daily upload limit reached for this gym');
              }
              break;

            case UploadLimitType.total:
              gymSubmissions = await ForgeRaceSubmission.countDocuments({
                'meta.quest.pool_id': poolId,
                status: ForgeSubmissionProcessingStatus.COMPLETED, // Only count completed submissions
                reward: { $gt: 0 } // Only count submissions that received a reward
              });

              if (gymSubmissions >= pool.uploadLimit.type) {
                throw ApiError.forbidden('Total upload limit reached for this gym');
              }
              break;
          }
        }

        // Check task-specific upload limit
        if (meta.quest?.task_id) {
          const app = await ForgeAppModel.findOne({
            pool_id: meta.poolId,
            'tasks._id': meta.quest.task_id
          });

          if (app) {
            const task = app.tasks.find((t) => t._id.toString() === meta.quest.task_id);
            const taskSubmissions = await ForgeRaceSubmission.countDocuments({
              'meta.quest.task_id': meta.quest.task_id,
              status: ForgeSubmissionProcessingStatus.COMPLETED, // Only count completed submissions
              reward: { $gt: 0 } // Only count submissions that received a reward
            });
            if (task?.uploadLimit) {
              if (taskSubmissions >= task.uploadLimit) {
                throw ApiError.forbidden('Upload limit reached for this task');
              }

              // Check gym-wide per-task limit if applicable
              if (
                pool.uploadLimit?.limitType === UploadLimitType.perTask &&
                pool.uploadLimit?.type &&
                taskSubmissions >= pool.uploadLimit.type
              ) {
                throw ApiError.forbidden('Per-task upload limit reached for this gym');
              }
            } else if (
              // also check gym-wide task limit even if there is no limit on the task itself
              pool.uploadLimit?.limitType === UploadLimitType.perTask &&
              pool.uploadLimit.type &&
              taskSubmissions >= pool.uploadLimit.type
            ) {
              throw ApiError.forbidden('Per-task upload limit reached for this gym');
            }
          }
        }
      }

      // check for existing submission
      const tempSub = await ForgeRaceSubmission.findById(uuid);
      if (tempSub) {
        throw ApiError.conflict('Submission data already uploaded', { submissionId: uuid });
      }

      // Create submission record
      const submission = await ForgeRaceSubmission.create({
        _id: uuid,
        address,
        meta,
        status: ForgeSubmissionProcessingStatus.PENDING,
        files: uploads
      });

      // Add to processing queue
      addToProcessingQueue(uuid);

      res.status(200).json(
        successResponse({
          message: 'Race data uploaded successfully',
          submissionId: submission._id,
          files: uploads
        })
      );
    } catch (error) {
      // Clean up temporary file on error
      if (req.file) {
        await unlink(req.file.path).catch(() => {});
      }
      throw new ApiError(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to upload race data: ' + error
      );
    }
  })
);

// Get any submission status -- requires authentication
router.get(
  '/:id',
  validateParams({ id: { required: true, rules: [ValidationRules.isString()] } }),
  requireWalletAddress,
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const submission = await ForgeRaceSubmission.findById(id);

    if (!submission) {
      throw ApiError.notFound('Submission not found');
    }

    res.status(200).json(
      successResponse({
        status: submission.status,
        grade_result: submission.grade_result,
        error: submission.error,
        meta: submission.meta,
        files: submission.files,
        reward: submission.reward,
        maxReward: submission.maxReward,
        clampedScore: submission.clampedScore,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt
      })
    );
  })
);
