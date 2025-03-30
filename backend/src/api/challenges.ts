import express, { Request, Response } from 'express';
import BlockchainService from '../services/blockchain/index.ts';
import dotenv from 'dotenv';
import DatabaseService from '../services/db/index.ts';
import VNCService from '../services/vnc/index.ts';
import fs from 'fs';
import path from 'path';
import { DBChat } from '../types/db.ts';
import { errorHandlerAsync } from '../middleware/errorHandler.ts';
import { validateParams, validateQuery, ValidationRules } from '../middleware/validator.ts';
import { ApiError, successResponse } from '../middleware/types/errors.ts';

dotenv.config();

const router = express.Router();
const solanaRpc = process.env.RPC_URL!;
const model = 'gpt-4o-mini';

// Time threshold for screenshot updates (5 seconds)
const SCREENSHOT_UPDATE_THRESHOLD = 5000;

/**
 * Get a challenge by name
 * GET /api/challenges/:name
 */
router.get(
  '/:name',
  validateParams({
    name: {
      required: true,
      rules: [ValidationRules.isString()]
    }
  }),
  validateQuery({
    initial: {
      required: false,
      rules: []
    },
    price: {
      required: false,
      rules: [
        {
          validate: (value) => {
            if (value === undefined) return true;
            const num = Number(value);
            return !isNaN(num) && num >= 0;
          },
          message: 'Price must be a non-negative number'
        }
      ]
    }
  }),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { name } = req.params;
    const initial = req.query.initial;
    let message_price = Number(req.query.price || 0);
    let prize = message_price * 100;

    const projection: { [key: string]: number } = {
      _id: 1,
      title: 1,
      label: 1,
      task: 1,
      tools_description: 1,
      custom_rules: 1,
      disable: 1,
      start_date: 1,
      charactersPerWord: 1,
      level: 1,
      model: 1,
      image: 1,
      pfp: 1,
      status: 1,
      name: 1,
      deployed: 1,
      idl: 1,
      tournamentPDA: 1,
      entryFee: 1,
      characterLimit: 1,
      contextLimit: 1,
      chatLimit: 1,
      initial_pool_size: 1,
      expiry: 1,
      developer_fee: 1,
      win_condition: 1,
      expiry_logic: 1,
      scores: 1,
      stream_src: 1
    };

    const challengeInitialized = await DatabaseService.findOneChat({
      challenge: { $regex: name, $options: 'i' }
    });

    if (!challengeInitialized) {
      projection.system_message = 1;
    }

    let challenge = await DatabaseService.getChallengeByName(name, projection);
    if (!challenge) {
      throw ApiError.notFound(`Challenge "${name}" not found`);
    }

    const challengeName = challenge.name!;
    const challengeId = challenge._id;
    const chatLimit = challenge.chatLimit as number | undefined; // type coercion for future use

    const allowedStatuses = ['active', 'concluded', 'upcoming'];

    if (!allowedStatuses.includes(challenge.status)) {
      throw ApiError.badRequest(`Challenge is not active (status: ${challenge.status})`);
    }

    // For upcoming challenges, return early with basic info
    if (challenge.status === 'upcoming') {
      return res.status(200).json(
        successResponse({
          challenge,
          break_attempts: 0,
          message_price: 0,
          prize: 0,
          usdMessagePrice: 0,
          usdPrize: 0,
          chatHistory: [],
          expiry: challenge.expiry,
          solPrice: await BlockchainService.getSolPriceInUSDT(),
          stream_src: challenge.stream_src
        })
      );
    }

    const programId = challenge.idl?.address;
    if (!programId) {
      throw ApiError.badRequest('Program ID not found');
    }

    const tournamentPDA = challenge.tournamentPDA;
    if (!tournamentPDA) {
      throw ApiError.badRequest('Tournament PDA not found');
    }

    const break_attempts = await DatabaseService.getChatCount({
      challenge: challengeName,
      role: 'user'
    });

    const chatProjection: { [key: string]: number } = {
      challenge: 1,
      role: 1,
      content: 1,
      display_name: 1,
      address: 1,
      txn: 1,
      date: 1,
      screenshot: 1
    };

    if (!challenge.tools_description) {
      chatProjection.tool_calls = 1;
    }

    const chatHistory = await DatabaseService.getFullChatHistory(
      {
        challenge: challengeName,
        role: { $ne: 'system' }
      },
      chatProjection,
      { date: -1 },
      chatLimit
    );

    if (!chatHistory) {
      throw ApiError.internalError('Error getting chat history');
    }

    const now = new Date();
    const expiry = challenge.expiry;
    const solPrice = await BlockchainService.getSolPriceInUSDT();

    let latestScreenshot = null;

    // Only attempt VNC screenshots for active tournaments
    if (challenge.status === 'active') {
      if (!challenge.stream_src) {
        const latestImagePath = path.join(
          process.cwd(),
          'public',
          'screenshots',
          `${tournamentPDA}_latest.jpg`
        );

        // Check if we need a new screenshot
        const needsNewScreenshot =
          !fs.existsSync(latestImagePath) ||
          (fs.existsSync(latestImagePath) &&
            now.getTime() - fs.statSync(latestImagePath).mtime.getTime() >
              SCREENSHOT_UPDATE_THRESHOLD);

        if (needsNewScreenshot) {
          try {
            // Initialize VNC session and get screenshot
            const session = await VNCService.ensureValidConnection(tournamentPDA);
            if (session) {
              const newScreenshot = await VNCService.getScreenshot(tournamentPDA);
              if (newScreenshot) {
                latestScreenshot = {
                  url: `/api/screenshots/${tournamentPDA}_latest.jpg?t=${newScreenshot.timestamp}`,
                  date: new Date(newScreenshot.timestamp || '')
                };
              }
            }
          } catch (error) {
            console.error('Failed to update screenshot:', error);
          }

          // If VNC failed or no new screenshot, try using existing _latest.jpg
          if (!latestScreenshot && fs.existsSync(latestImagePath)) {
            const stats = fs.statSync(latestImagePath);
            latestScreenshot = {
              url: `/api/screenshots/${tournamentPDA}_latest.jpg?t=${stats.mtimeMs}`,
              date: stats.mtime
            };
          }
        } else {
          // Use existing _latest.jpg if it's fresh enough
          const stats = fs.statSync(latestImagePath);
          latestScreenshot = {
            url: `/api/screenshots/${tournamentPDA}_latest.jpg?t=${stats.mtimeMs}`,
            date: stats.mtime
          };
        }
      }
    }

    // Fall back to chat history screenshots if needed
    if (!latestScreenshot && chatHistory.length > 0) {
      const screenshotMessages = chatHistory.filter((msg) => msg.screenshot?.url);
      if (screenshotMessages.length > 0) {
        const lastScreenshot = screenshotMessages[0]; // First since sorted by date desc
        latestScreenshot = {
          url: lastScreenshot.screenshot?.url,
          date: lastScreenshot.date
        };
      }
    }

    if (chatHistory.length > 0) {
      if (expiry! < now && challenge.status === 'active') {
        let winner;
        if (challenge.expiry_logic === 'score') {
          const topScoreMsg = await DatabaseService.getHighestAndLatestScore(challengeName);
          winner = topScoreMsg?.[0]?.address || topScoreMsg?.[0]?.account;
        } else {
          winner = chatHistory[0].address;
        }
        const blockchainService = new BlockchainService(solanaRpc, programId);
        const concluded = await blockchainService.concludeTournament(tournamentPDA, winner!);
        const successMessage = `🥳 Tournament concluded: ${concluded}`;
        const assistantMessage: DBChat = {
          challenge: challengeName,
          model: model,
          role: 'assistant',
          content: successMessage,
          tool_calls: {},
          address: winner!,
          display_name: winner
        };

        await DatabaseService.createChat(assistantMessage);
        await DatabaseService.updateChallenge(challengeId!, {
          status: 'concluded'
        });
      }

      message_price = challenge.entryFee!;
      prize = message_price * 100;

      const usdMessagePrice = message_price * solPrice;
      const usdPrize = prize * solPrice;

      return res.status(200).json(
        successResponse({
          challenge,
          break_attempts,
          message_price,
          prize,
          usdMessagePrice,
          usdPrize,
          expiry,
          solPrice,
          chatHistory: chatHistory.reverse(),
          latestScreenshot,
          stream_src: challenge.stream_src
        })
      );
    }

    if (!challengeInitialized) {
      const firstPrompt = challenge.system_message;
      await DatabaseService.createChat({
        challenge: challengeName,
        model: model,
        role: 'system',
        content: firstPrompt!,
        address: challenge.tournamentPDA!
      });
    }

    if (initial) {
      const blockchainService = new BlockchainService(solanaRpc, programId);
      const tournamentData = await blockchainService.getTournamentData(tournamentPDA);

      if (!tournamentData) {
        throw ApiError.internalError('Error getting tournament data');
      }

      message_price = tournamentData.entryFee;
      prize = message_price * 100;
    }

    const usdMessagePrice = message_price * solPrice;
    const usdPrize = prize * solPrice;

    return res.status(200).json(
      successResponse({
        challenge,
        break_attempts,
        message_price,
        prize,
        usdMessagePrice,
        usdPrize,
        chatHistory,
        expiry,
        solPrice,
        latestScreenshot,
        stream_src: challenge.stream_src
      })
    );
  })
);

/**
 * List all challenges with optional filtering
 * GET /api/challenges
 */
router.get(
  '/',
  validateQuery({
    status: {
      required: false,
      rules: [
        ValidationRules.isIn(
          ['active', 'upcoming', 'concluded', 'draft'],
          'Status must be one of: active, upcoming, concluded, draft'
        )
      ]
    },
    limit: {
      required: false,
      rules: [
        {
          validate: (value) => {
            if (value === undefined) return true;
            const num = parseInt(value as string);
            return !isNaN(num) && num > 0 && num <= 100;
          },
          message: 'Limit must be a number between 1 and 100'
        }
      ]
    },
    offset: {
      required: false,
      rules: [
        {
          validate: (value) => {
            if (value === undefined) return true;
            const num = parseInt(value as string);
            return !isNaN(num) && num >= 0;
          },
          message: 'Offset must be a non-negative number'
        }
      ]
    }
  }),
  errorHandlerAsync(async (req: Request, res: Response) => {
    const { status, limit = '10', offset = '0' } = req.query;

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // Parse pagination params
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    // Get challenges
    const challenges = await DatabaseService.getAllChallenges();

    // Filter and paginate the challenges in memory
    const filteredChallenges = (Array.isArray(challenges) ? challenges : [])
      .filter((c: any) => !status || c.status === status)
      .slice(offsetNum, offsetNum + limitNum);

    const total = filteredChallenges.length;

    return res.status(200).json(
      successResponse({
        challenges: filteredChallenges,
        pagination: {
          total,
          offset: offsetNum,
          limit: limitNum
        }
      })
    );
  })
);

export { router as challengesApi };
