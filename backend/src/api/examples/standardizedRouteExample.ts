import express, { Request, Response } from 'express';
import { errorHandlerAsync } from '../middleware/errorHandler.ts';
import { validateBody, validateParams, validateQuery } from '../middleware/validator.ts';
import {
  createChallengeSchema,
  getChallengeByNameSchema,
  getChallengesSchema,
  updateChallengeSchema
} from '../schemas/challenge.ts';
import { ApiError, successResponse } from '../types/errors.ts';
import DatabaseService from '../../services/db/index.ts';

const router = express.Router();

/**
 * Example route that demonstrates how to use the standardized API utilities
 *
 * GET /api/challenges/:name
 * Get a challenge by name
 */
router.get(
  '/:name',
  validateParams(getChallengeByNameSchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { name } = req.params;

    const challenge = await DatabaseService.getChallengeByName(name);

    if (!challenge) {
      throw ApiError.notFound(`Challenge with name "${name}" not found`);
    }

    // Return standardized success response
    res.status(200).json(successResponse({ challenge }));
  })
);

/**
 * Example route that demonstrates how to use the standardized API utilities
 *
 * POST /api/challenges
 * Create a new challenge
 */
router.post(
  '/',
  validateBody(createChallengeSchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { name, title, task, system_message, expiry, entryFee, ...otherFields } = req.body;

    // Check if challenge already exists
    const existingChallenge = await DatabaseService.getChallengeByName(name);
    if (existingChallenge) {
      throw ApiError.conflict(`Challenge with name "${name}" already exists`);
    }

    // Create challenge - Note: This is an example, use the actual method from your DatabaseService
    const challenge = await DatabaseService.createChat({
      name,
      title,
      task,
      system_message,
      expiry: new Date(expiry),
      entryFee,
      status: otherFields.status || 'upcoming',
      ...otherFields
    });

    // Return standardized success response
    res.status(201).json(successResponse({ challenge }));
  })
);

/**
 * Example route that demonstrates how to use the standardized API utilities
 *
 * PUT /api/challenges/:id
 * Update an existing challenge
 */
router.put(
  '/:id',
  validateParams({
    id: { required: true, rules: [] }
  }),
  validateBody(updateChallengeSchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    // Check if challenge exists
    const existingChallenge = await DatabaseService.getChallengeById(id);
    if (!existingChallenge) {
      throw ApiError.notFound(`Challenge with ID "${id}" not found`);
    }

    // Convert expiry string to Date if provided
    if (updateData.expiry) {
      updateData.expiry = new Date(updateData.expiry);
    }

    // Update challenge
    const updatedChallenge = await DatabaseService.updateChallenge(id, updateData);

    // Return standardized success response
    res.status(200).json(successResponse({ challenge: updatedChallenge }));
  })
);

/**
 * Example route that demonstrates how to use the standardized API utilities
 *
 * GET /api/challenges
 * Get all challenges with optional filtering
 */
router.get(
  '/',
  validateQuery(getChallengesSchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { status, limit = '10', page = '1' } = req.query;

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // Parse pagination params
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    // Get challenges - Note: This is an example, use the actual methods from your DatabaseService
    // Replace these with your actual database service methods
    const challenges = await DatabaseService.getAllChallenges();

    // Filter and paginate the challenges in memory (or use your actual database methods)
    // Using type assertion to handle potential false return value
    const challengesArray = challenges || [];
    const filteredChallenges = (Array.isArray(challengesArray) ? challengesArray : [])
      .filter((c: any) => !status || c.status === status)
      .slice(skip, skip + limitNum);

    const total = filteredChallenges.length;

    // Return standardized success response with pagination info
    res.status(200).json(
      successResponse({
        challenges,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      })
    );
  })
);

/**
 * Example route that demonstrates how to use the standardized API utilities
 *
 * DELETE /api/challenges/:id
 * Delete a challenge
 */
router.delete(
  '/:id',
  validateParams({
    id: { required: true }
  }),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if challenge exists
    const existingChallenge = await DatabaseService.getChallengeById(id);
    if (!existingChallenge) {
      throw ApiError.notFound(`Challenge with ID "${id}" not found`);
    }

    // Delete challenge - Note: This is an example, use the actual method from your DatabaseService
    // Since there's no deleteChallenge method, you might use updateChallenge to mark it as deleted
    await DatabaseService.updateChallenge(id, { status: 'deleted' });

    // Return standardized success response
    res.status(200).json(
      successResponse({
        message: `Challenge "${existingChallenge.name}" successfully deleted`
      })
    );
  })
);

export { router as exampleChallengesRoute };
