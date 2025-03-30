import express, { Request, Response } from 'express';
import DatabaseService from '../services/db/index.ts';
import {
  checkRaceExpiration,
  generateHint,
  generateQuest,
  GymVPSService,
  stopRaceSession
} from '../services/gym/index.ts';
import GuacamoleService from '../services/guacamole/index.ts';
import { Webhook } from '../services/webhook/index.ts';
import dotenv from 'dotenv';
import { TrainingEventModel } from '../models/TrainingEvent.ts';
import { RaceSessionModel } from '../models/Models.ts';
import { VPSRegion } from '../types/gym.ts';
import { DBRaceSession } from '../types/db.ts';
import { errorHandlerAsync } from '../middleware/errorHandler.ts';
import {
  validateBody,
  validateParams,
  validateQuery,
  ValidationRules
} from '../middleware/validator.ts';
import {
  exportSessionQuerySchema,
  exportSessionsSchema,
  hintRequestSchema,
  raceFeedbackSchema,
  startRaceSessionSchema,
  updateRaceSessionSchema
} from './schemas/races.ts';
import { ApiError, ErrorCode, successResponse } from '../middleware/types/errors.ts';

dotenv.config();

const router = express.Router();

type RaceCategory = 'creative' | 'mouse' | 'slacker' | 'gaming' | 'wildcard';
type RaceSessionInput = Omit<DBRaceSession, '_id'> & {
  category: RaceCategory;
};

// Initialize blockchain service
const guacService = new GuacamoleService();

const generatingHints = new Set<string>();

// List all available races
router.get(
  '/',
  errorHandlerAsync(async (_req: Request, res: Response) => {
    const races = await DatabaseService.getRaces();
    if (!races) {
      throw ApiError.notFound('No races found');
    }
    res.status(200).json(successResponse(races));
  })
);

// Start a new race session
router.post(
  '/:id/start',
  validateParams({ id: { required: true, rules: [ValidationRules.isString()] } }),
  validateBody(startRaceSessionSchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { address, region } = req.body;

    // Get the race details
    const race = await DatabaseService.getRaceById(id);
    if (!race) {
      throw ApiError.notFound('Race not found');
    }

    // Get an open vps instance

    // get vps region programatically
    let regionEnum: VPSRegion = VPSRegion.us_east;
    if (region?.includes('us-east')) regionEnum = VPSRegion.us_east;
    if (region?.includes('us-west')) regionEnum = VPSRegion.us_west;
    if (region?.includes('eu-central')) regionEnum = VPSRegion.eu_central;
    if (region?.includes('ap-southeast')) regionEnum = VPSRegion.ap_southeast;
    const instance = await DatabaseService.getGymVPS(regionEnum);
    const vpsService = new GymVPSService({
      ip: instance.ip,
      username: instance.username,
      privateKey: instance.ssh_keypair.private
    });
    let streamId = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 16) {
      streamId += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    const vps = await vpsService.initNewTrainer(address, streamId);

    // Create Guacamole session with RDP connection
    const {
      token: authToken,
      connectionId,
      clientId
    } = await guacService.createSession(vps.ip, vps.username, vps.password, address);

    // Create race session
    const now = new Date();
    const sessionData: RaceSessionInput = {
      address,
      challenge: id,
      prompt: race.prompt,
      status: 'active',
      vm_ip: instance.ip,
      vm_port: 3389,
      vm_password: instance.ssh_keypair.private,
      vm_region: regionEnum,
      vm_credentials: {
        username: vps.username,
        password: vps.password,
        guacToken: authToken,
        guacConnectionId: connectionId,
        guacClientId: clientId
      },
      created_at: now,
      updated_at: now,
      category: 'creative' as RaceCategory,
      stream_id: streamId
    };

    const session = await DatabaseService.createRaceSession(sessionData);

    if (!session) {
      // Clean up Guacamole resources on failure
      await guacService.cleanupSession(authToken, connectionId);
      throw ApiError.internalError('Faled to create race session');
    }

    // Construct Guacamole URL with encoded client ID
    const guacURL = `${
      process.env.GUACAMOLE_URL || '/guacamole'
    }/#/client/${clientId}?token=${authToken}`;

    res.status(200).json(
      successResponse({
        sessionId: (session as any)._id,
        vm_ip: session.vm_ip,
        vm_port: session.vm_port,
        vm_credentials: session.vm_credentials,
        guacURL
      })
    );
  })
);

// Get race session status
router.get(
  '/session/:id',
  validateParams({ id: { required: true, rules: [ValidationRules.isString()] } }),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if session is expired first
    const isExpired = await checkRaceExpiration(guacService, id);
    if (isExpired) {
      throw new ApiError(410, ErrorCode.GONE, 'Session expired');
    }

    // Get fresh session data after expiry check
    const session = await DatabaseService.getRaceSession(id);
    if (!session) {
      throw ApiError.notFound('Session not found');
    }

    // If session is not active after expiry check, return 410
    if (session.status !== 'active') {
      throw new ApiError(410, ErrorCode.GONE, 'Session expired');
    }

    res.status(200).json(
      successResponse({
        status: session.status,
        vm_credentials: session.vm_credentials,
        created_at: session.created_at,
        updated_at: session.updated_at,
        preview: session.preview
      })
    );
  })
);

// Stop a race session
router.post(
  '/session/:id/stop',
  validateParams({ id: { required: true, rules: [ValidationRules.isString()] } }),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await stopRaceSession(guacService, id);
    res.status(200).json(successResponse(result));
  })
);

// Update race session status
router.put(
  '/session/:id',
  validateParams({ id: { required: true, rules: [ValidationRules.isString()] } }),
  validateBody(updateRaceSessionSchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const session = await DatabaseService.updateRaceSession(id, { status });
    if (!session) {
      throw ApiError.notFound('Session not found');
    }

    res.status(200).json(
      successResponse({
        status: session.status,
        vm_credentials: session.vm_credentials,
        created_at: session.created_at,
        updated_at: session.updated_at
      })
    );
  })
);

// Submit feedback/race idea
router.post(
  '/feedback',
  validateBody(raceFeedbackSchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { raceIdea } = req.body;

    // Forward to webhook if configured
    const webhookUrl = process.env.FEEDBACK_WEBHOOK;
    if (webhookUrl) {
      const webhook = new Webhook(webhookUrl);
      await webhook.sendText(`New Race Idea Submission:\n${raceIdea}`);
    }

    res.status(200).json(successResponse('Feedback received'));
  })
);

// Check for active race session
router.get(
  '/active',
  errorHandlerAsync(async (req: Request, res: Response) => {
    const walletAddress = req.headers['x-wallet-address'] as string;
    if (!walletAddress) {
      throw ApiError.badRequest('Wallet address is required');
    }

    // First, handle expired sessions in bulk
    const now = Date.now();
    const expiryTime = now - 15 * 60 * 1000; // 15 minutes ago
    const inactiveTime = now - 60 * 1000; // 1 minute ago

    // Update expired sessions in a single operation - only those that are actually expired
    await RaceSessionModel.updateMany(
      {
        address: walletAddress,
        status: 'active',
        $or: [
          { created_at: { $lt: new Date(expiryTime) } },
          { updated_at: { $lt: new Date(inactiveTime) } }
        ]
      },
      {
        $set: {
          status: 'expired',
          updated_at: new Date()
        }
      }
    );

    // Find active race session - this will only find sessions that are still active after the update
    const activeRaceSession = await RaceSessionModel.findOne({
      address: walletAddress,
      status: 'active'
    });

    if (!activeRaceSession) {
      res.status(200).json(successResponse({ active: false }));
      return;
    }

    res.status(200).json(
      successResponse({
        active: true,
        sessionId: activeRaceSession._id
      })
    );
  })
);

// List all race sessions
router.get(
  '/history',
  errorHandlerAsync(async (req: Request, res: Response) => {
    const walletAddress = req.headers['x-wallet-address'] as string;
    if (!walletAddress) {
      throw ApiError.badRequest('Wallet address is required');
    }

    // First, handle expired sessions in bulk
    const now = Date.now();
    const expiryTime = now - 15 * 60 * 1000; // 15 minutes ago
    const inactiveTime = now - 60 * 1000; // 1 minute ago

    // Update expired sessions in a single operation
    await RaceSessionModel.updateMany(
      {
        address: walletAddress,
        status: 'active',
        $or: [
          { created_at: { $lt: new Date(expiryTime) } },
          { updated_at: { $lt: new Date(inactiveTime) } }
        ]
      },
      {
        $set: {
          status: 'expired',
          updated_at: new Date()
        }
      }
    );

    // Use MongoDB aggregation to get all data in a single query
    const aggregationPipeline = [
      // Match sessions for this wallet
      {
        $match: {
          address: walletAddress
        }
      },
      // Sort by creation date descending (using type assertion to satisfy TypeScript)
      {
        $sort: {
          created_at: -1 as -1
        }
      },
      // Project only the fields we need
      {
        $project: {
          _id: 1,
          status: 1,
          challenge: 1,
          category: 1,
          video_path: 1,
          created_at: 1,
          transaction_signature: 1,
          preview: 1
        }
      },
      // Lookup training events for each session
      {
        $lookup: {
          from: 'training_events',
          localField: '_id',
          foreignField: 'session',
          as: 'events'
        }
      },
      // Add computed fields
      {
        $addFields: {
          actionTokens: { $size: '$events' },
          // Find quest events
          questEvents: {
            $filter: {
              input: '$events',
              as: 'event',
              cond: { $eq: ['$$event.type', 'quest'] }
            }
          },
          // Find reward events
          rewardEvents: {
            $filter: {
              input: '$events',
              as: 'event',
              cond: {
                $and: [
                  { $eq: ['$$event.type', 'reward'] },
                  { $ne: ['$$event.metadata.rewardValue', null] }
                ]
              }
            }
          }
        }
      },
      // Calculate earnings and get title
      {
        $addFields: {
          earnings: {
            $reduce: {
              input: '$rewardEvents',
              initialValue: 0,
              in: { $add: ['$$value', { $ifNull: ['$$this.metadata.rewardValue', 0] }] }
            }
          },
          title: {
            $cond: {
              if: { $gt: [{ $size: '$questEvents' }, 0] },
              then: { $arrayElemAt: ['$questEvents.message', 0] },
              else: { $concat: ['Race ', '$challenge'] }
            }
          }
        }
      },
      // Final projection to clean up response - only include fields we want
      {
        $project: {
          _id: 1,
          status: 1,
          challenge: 1,
          category: 1,
          video_path: 1,
          created_at: 1,
          transaction_signature: 1,
          preview: 1,
          actionTokens: 1,
          earnings: 1,
          title: 1
          // Removed exclusions to avoid MongoDB error
        }
      }
    ];

    const enrichedRaces = await RaceSessionModel.aggregate(aggregationPipeline);

    if (!enrichedRaces || enrichedRaces.length === 0) {
      throw ApiError.notFound('No races found');
    }

    res.status(200).json(successResponse(enrichedRaces));
  })
);

// Request a hint for current quest
// Also creates the initial quest if there isn't one
router.post(
  '/session/:id/hint',
  validateParams({
    id: {
      required: true,
      rules: [ValidationRules.isString()]
    }
  }),
  validateBody(hintRequestSchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const session = await DatabaseService.getRaceSession(id);

    if (!session) {
      throw ApiError.notFound('Session not found');
    }

    // Check if session is expired
    if (await checkRaceExpiration(guacService, id)) {
      throw ApiError.badRequest('Race session has expired');
    }

    // Check for active guacamole session
    const guacSession = await guacService.getActiveSession(session.address);
    if (!guacSession) {
      throw ApiError.badRequest('No active guacamole session');
    }

    // Get screenshot from request body
    const { screenshot } = req.body;

    // if theres a screenshot but no initial quest
    // then assume the initial quest is still generating & abort
    if (session.preview) {
      const latestQuestEvent = await TrainingEventModel.findOne(
        { session: id, type: 'quest' },
        {},
        { sort: { timestamp: -1 } }
      );

      if (!latestQuestEvent) {
        res.status(202).json(
          successResponse({
            message: 'Initial quest is still generating',
            isGenerating: true
          })
        );
        return;
      }
    }

    // Store latest screenshot in session metadata
    await DatabaseService.updateRaceSession(id, {
      preview: screenshot,
      updated_at: new Date()
    });

    // Create a proper image URL for OpenAI
    const imageUrl = screenshot;

    // Get current quest from latest quest event
    const latestQuestEvent = await TrainingEventModel.findOne(
      { session: id, type: 'quest' },
      {},
      { sort: { timestamp: -1 } }
    );

    // Get hint history
    const hintEvents = await TrainingEventModel.find(
      { session: id, type: 'hint' },
      { message: 1 },
      { sort: { timestamp: -1 }, limit: 3 }
    );
    const hintHistory = hintEvents.map((e) => e.message);

    // Get current max reward from latest quest event
    const maxReward = latestQuestEvent?.metadata?.maxReward || 0;

    // If no quest exists at all, generate initial quest
    if (!latestQuestEvent) {
      console.log('No quest found for session:', id, 'generating initial quest...');
      const questData = await generateQuest(imageUrl, session.prompt, session);
      const questEvent = {
        type: 'quest',
        message: questData.quest,
        session: id,
        frame: 0,
        timestamp: Date.now(),
        metadata: {
          maxReward: questData.maxReward,
          vm_id: guacSession.connectionId,
          recording_id: guacSession.recordingId
        }
      };
      await DatabaseService.createTrainingEvent(questEvent);

      // Create initial hint event
      const hintEvent = {
        type: 'hint',
        message: questData.hint,
        session: id,
        frame: 0,
        timestamp: Date.now()
      };
      await DatabaseService.createTrainingEvent(hintEvent);

      res.status(200).json(
        successResponse({
          quest: questData.quest,
          hint: questData.hint,
          maxReward: questData.maxReward,
          events: [questEvent, hintEvent]
        })
      );
    } else {
      const result = await generateHint(
        generatingHints,
        imageUrl,
        latestQuestEvent.message,
        session.prompt,
        session,
        maxReward,
        hintHistory
      );

      // Clear generating hint flag before returning
      if (session._id) {
        generatingHints.delete(session._id.toString());
      }

      // Return events for frontend to process
      res.status(200).json(successResponse(result));
    }
  })
);

// Export training events for selected race sessions
router.get(
  '/export',
  validateQuery(exportSessionQuerySchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { sessionId } = req.query;

    // Get the session
    const session = await DatabaseService.getRaceSession(sessionId as string);
    if (!session) {
      throw ApiError.notFound('Session not found');
    }

    // Get all events for this session
    const sessionEvents = await TrainingEventModel.find({
      session: session._id
    }).sort({ timestamp: 1 }); // Sort by timestamp ascending
    // Transform events into a more readable format
    const events = sessionEvents.map((event) => ({
      session_id: session._id,
      challenge: session.challenge,
      category: session.category,
      type: event.type,
      message: event.message,
      timestamp: event.timestamp,
      frame: event.frame,
      coordinates: event.coordinates,
      trajectory: event.trajectory,
      metadata: event.metadata
    }));

    // Add session metadata
    const result = {
      session_id: session._id,
      challenge: session.challenge,
      category: session.category,
      transaction_signature: session.transaction_signature,
      events
    };

    res.status(200).json(successResponse(result));
  })
);

// Export training events for multiple race sessions
router.post(
  '/export',
  validateBody(exportSessionsSchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { sessionIds } = req.body;

    console.log(`Exporting data for ${sessionIds.length} sessions:`, sessionIds);

    // Get all sessions first
    const sessions = await DatabaseService.getRaceSessionsByIds(sessionIds);
    if (!sessions) {
      throw ApiError.notFound('No sessions found');
    }

    console.log(`Found ${sessions.length} sessions`);

    // Get all training events for the selected sessions
    const events = await Promise.all(
      sessions.map(async (session) => {
        const sessionEvents = await TrainingEventModel.find({
          session: session._id
        }).sort({ timestamp: 1 }); // Sort by timestamp ascending
        // Transform events into a more readable format
        const events = sessionEvents.map((event) => ({
          session_id: session._id,
          challenge: session.challenge,
          category: session.category,
          type: event.type,
          message: event.message,
          timestamp: event.timestamp,
          frame: event.frame,
          coordinates: event.coordinates,
          trajectory: event.trajectory,
          metadata: event.metadata
        }));

        // Add session metadata including video path
        return {
          session_id: session._id,
          challenge: session.challenge,
          category: session.category,
          video_path: session.video_path
            ? '/api/recordings/' + session.video_path.split('/').pop()
            : null,
          events
        };
      })
    );

    // Flatten the array of arrays
    const flatEvents = events.flat();

    res.status(200).json(successResponse(flatEvents));
  })
);

export { router as racesApi };
