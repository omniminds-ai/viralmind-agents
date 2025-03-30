import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import DatabaseService from '../services/db/index.ts';
import zstd from '@mongodb-js/zstd';
import { AWSS3Service } from '../services/aws/index.ts';
import { errorHandlerAsync } from '../middleware/errorHandler.ts';
import { validateBody, validateParams, validateQuery } from '../middleware/validator.ts';
import {
  challengeChatStreamSchema,
  raceDataStreamParamsSchema,
  raceDataStreamQuerySchema,
  raceDataStreamBodySchema
} from './schemas/streams.ts';
import { ApiError, successResponse } from '../middleware/types/errors.ts';
dotenv.config();

const router = express.Router();
export const clients = new Set<Response>();

// Modify the event handler to properly format SSE messages
DatabaseService.on('new-chat', async (chatData) => {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify({ type: 'message', message: chatData })}\n\n`);
  });
});

router.get(
  '/challenge-chat',
  validateQuery(challengeChatStreamSchema),
  async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client

    const name = req.query.name as string;
    if (!name) {
      res.status(400).send('Challenge name is required');
      return;
    }

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
      res.status(404).send('Challenge not found');
      return;
    }

    const challengeName = challenge.name;

    const allowedStatuses = ['active', 'concluded', 'upcoming'];
    if (!allowedStatuses.includes(challenge.status)) {
      res.status(404).send('Challenge is not active');
      return;
    }

    console.log('Stream Initialized');

    // Send initial connection message with proper SSE format
    res.write(
      `data: ${JSON.stringify({
        type: 'connection',
        message: `Connected to chat stream for ${challengeName}`
      })}\n\n`
    );

    console.log('Stream set');
    // Add client to the set
    clients.add(res);

    // Remove client on connection close
    req.on('close', () => {
      clients.delete(res);
      console.log('Client disconnected');
    });

    // Handle connection timeout
    req.on('error', (error) => {
      console.error('SSE error:', error);
      clients.delete(res);
    });
  }
);

// Store active sessions and their collected data
const raceDataStreams = new Map<
  string,
  {
    timeoutId: NodeJS.Timeout;
    data: {
      data: any;
      type: string;
      platform: string;
    }[]; // Array to store all received data
  }
>();

// Function to process data and cleanup
const processAndCleanup = async (sid: string) => {
  const connection = raceDataStreams.get(sid);
  if (connection) {
    clearTimeout(connection.timeoutId);

    try {
      const processedResults = connection.data.map((data) => {
        return {
          timestamp: Date.now(),
          sid: sid,
          type: data.type,
          platform: data.platform,
          tree: data.data
        };
      });
      const compressedResults = await zstd.compress(
        Buffer.from(JSON.stringify(processedResults)),
        10
      );
      // handle low data culling
      if (connection.data.length > 1) {
        const s3Service = new AWSS3Service(process.env.AWS_ACCESS_KEY, process.env.AWS_SECRET_KEY);
        // wrap this function so the user doesn't have to wait for this
        (async () => {
          await s3Service.saveItem({
            bucket: 'training-gym',
            file: compressedResults,
            name: `tree-${sid}.json.zst`
          });
        })();
      }
    } catch (error) {
      console.error(`Error processing data for session ${sid}:`, error);
    }

    raceDataStreams.delete(sid);
  }
};

// POST endpoint to handle data
router.post(
  '/races/:stream/data',
  validateParams(raceDataStreamParamsSchema),
  validateQuery(raceDataStreamQuerySchema),
  validateBody(raceDataStreamBodySchema),
  errorHandlerAsync(async (req: Request, res: Response) => {
    if (req.query.secret !== process.env.AX_PARSER_SECRET) {
      throw ApiError.unauthorized('Incorrect AX Parser secret');
    }

    const streamId = req.params.stream; // linux username for the user
    const session = await DatabaseService.getRaceSessionByStream(streamId);
    if (!session) {
      throw ApiError.notFound(`No session present for ${streamId}`);
    }
    const sid = session._id!.toString();

    const data: { data: any; type: string; platform: string } = req.body;

    let connection = raceDataStreams.get(sid);
    if (!connection) {
      connection = {
        timeoutId: setTimeout(() => {
          console.log(`streams: Connection ${sid} timed out`);
          processAndCleanup(sid);
        }, 10000),
        data: []
      };
    }

    raceDataStreams.set(sid, connection);

    connection.data.push(data);

    clearTimeout(connection.timeoutId);
    connection.timeoutId = setTimeout(() => {
      processAndCleanup(sid);
    }, 20000);

    raceDataStreams.set(sid, connection);

    return res.status(200).json(
      successResponse({
        status: 'data_received',
        timestamp: new Date().toISOString(),
        data_points: connection.data.length
      })
    );
  })
);

export { router as streamsApi };
