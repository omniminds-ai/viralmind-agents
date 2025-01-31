import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import DatabaseService from '../services/db/index.ts';
import bodyParser from 'body-parser';
import { writeFile } from 'fs/promises';
dotenv.config();

const router = express.Router();
export const clients = new Set<Response>();

// Modify the event handler to properly format SSE messages
DatabaseService.on('new-chat', async (chatData) => {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify({ type: 'message', message: chatData })}\n\n`);
  });
});

router.get('/challenge-chat', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE with client

  const name = req.query.name;
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

  let challenge = await DatabaseService.getChallengeByName(name as string, projection);
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
});

interface RaceStreamData {
  data: any;
  type: string;
  platform: string;
}

// Store active sessions and their collected data
const raceDataStreams = new Map<
  string,
  {
    timeoutId: NodeJS.Timeout;
    data: RaceStreamData[]; // Array to store all received data
  }
>();

// Function to process data and cleanup
const processAndCleanup = async (sid: string) => {
  const connection = raceDataStreams.get(sid);
  if (connection) {
    clearTimeout(connection.timeoutId);

    try {
      console.log(`Processing ${connection.data.length} data points for session ${sid}`);
      const processedResults = connection.data.map((data) => {
        return {
          timestamp: Date.now(),
          sid: sid,
          type: data.type,
          platform: data.platform,
          tree: data.data
        };
      });
      await writeFile(`./trees/tree-${sid}.json`, JSON.stringify(processedResults));
      //todo: store to s3
    } catch (error) {
      console.error(`Error processing data for session ${sid}:`, error);
    }

    raceDataStreams.delete(sid);
  }
};

// POST endpoint to handle data
router.post('/races/:sid/data', async (req: Request, res: Response) => {
  const sid = req.params.sid;

  try {
    const data: RaceStreamData = req.body;

    let connection = raceDataStreams.get(sid);
    if (!connection) {
      connection = {
        timeoutId: setTimeout(() => {
          console.log(`Connection ${sid} timed out`);
          processAndCleanup(sid);
        }, 20000),
        data: []
      };
    }

    raceDataStreams.set(sid, connection);

    connection.data.push(data);

    clearTimeout(connection.timeoutId);
    connection.timeoutId = setTimeout(() => {
      console.log(`Connection ${sid} timed out`);
      processAndCleanup(sid);
    }, 20000);

    raceDataStreams.set(sid, connection);

    res.status(200).json({
      status: 'data_received',
      timestamp: new Date().toISOString(),
      data_points: connection.data.length
    });
  } catch (error) {
    console.error('Error setting up stream handler:', error);
    res.status(500).send({ error: 'Failed to set up stream handler' });
  }
});

export { router as streamsRoute };
