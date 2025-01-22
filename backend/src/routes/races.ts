import express, { Request, Response } from 'express';
import DatabaseService, { RaceSessionDocument } from '../services/db/index.ts';
import { GymVPSService } from '../services/gym-vps/index.ts';
import { getEpisode } from './socket.ts';
import GuacamoleService from '../services/guacamole/index.ts';

import { TrainingEvent } from '../models/TrainingEvent.ts';
import { Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import BlockchainService from '../services/blockchain/index.ts';

const router = express.Router();

type RaceCategory = 'creative' | 'mouse' | 'slacker' | 'gaming' | 'wildcard';
type RaceSessionInput = Omit<RaceSessionDocument, '_id'> & {
  category: RaceCategory;
};

const solanaRpc = process.env.RPC_URL!;
const viralToken = process.env.VIRAL_TOKEN!;
const treasuryWalletPath = process.env.GYM_TREASURY_WALLET!;

// Initialize blockchain service
const blockchainService = new BlockchainService(solanaRpc, '');
const guacService = new GuacamoleService();

// Load treasury wallet
const treasuryKeypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(treasuryWalletPath, 'utf-8')))
);

// Get treasury balance endpoint
router.get('/treasury-balance', async (req, res) => {
  try {
    const balance = await blockchainService.getTokenBalance(
      viralToken,
      treasuryKeypair.publicKey.toBase58()
    );
    res.json({ balance });
  } catch (error) {
    console.error('Error getting treasury balance:', error);
    res.status(500).json({ error: 'Failed to get treasury balance' });
  }
});

// List all available races
router.get('/', async (_req: Request, res: Response) => {
  try {
    const races = await DatabaseService.getRaces();
    if (!races) {
      res.status(404).json({ error: 'No races found' });
      return;
    }
    res.json(races);
  } catch (error) {
    console.error('Error fetching races:', error);
    res.status(500).json({ error: 'Failed to fetch races' });
  }
});

// Start a new race session
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    console.log('starting a new race!');

    const { id } = req.params;
    const { address } = req.body;

    if (!address) {
      res.status(400).json({ error: 'Address is required' });
      return;
    }

    // Get the race details
    const race = await DatabaseService.getRaceById(id);
    if (!race) {
      res.status(404).json({ error: 'Race not found' });
      return;
    }

    // Get an open vps instance
    console.log('Joining a Race');

    // NOTE: in the future, we should be grabbing the ip and private keys from the database based upon the user's region
    const vpsService = new GymVPSService({
      ip: process.env.GYM_VPS_IP!,
      username: 'ubuntu', // default sudo user
      privateKey: process.env.GYM_VPS_PRIVATE_KEY!
    });
    const vps = await vpsService.initNewTrainer(address);

    // Create Guacamole session with RDP connection
    const {
      token: authToken,
      connectionId,
      clientId
    } = await guacService.createSession(vps.ip, vps.username, vps.password);

    // Create race session
    const now = new Date();
    //todo: convert RaceSessionInput to work with RDP.
    /* 
      vm_ip: process.env.GYM_VPS_IP!,
      vm_port: 3389,
      vm_private_key: process.env.GYP_VPS_PRIVATE_KEY!,
    */
    const sessionData: RaceSessionInput = {
      address,
      challenge: id,
      prompt: race.prompt,
      status: 'active',
      vm_ip: process.env.VNC_HOST_GYMTEST || process.env.GYM_VPS_IP!,
      vm_port: 5900,
      vm_password: process.env.VNC_PASS_GYMTEST || process.env.GYP_VPS_PRIVATE_KEY!,
      vm_credentials: {
        username: vps.username,
        password: vps.password,
        guacToken: authToken,
        guacConnectionId: connectionId,
        guacClientId: clientId
      },
      created_at: now,
      updated_at: now,
      category: 'creative' as RaceCategory
    };

    const session = await DatabaseService.createRaceSession(sessionData);

    if (!session) {
      // Clean up Guacamole resources on failure
      await guacService.cleanupSession(authToken, connectionId);
      res.status(500).json({ error: 'Failed to create race session' });
      return;
    }

    // Construct Guacamole URL with encoded client ID
    const guacURL = `${
      process.env.GUACAMOLE_URL || 'http://localhost/guacamole'
    }/#/client/${clientId}?token=${authToken}`;

    res.json({
      sessionId: (session as any)._id,
      vm_ip: session.vm_ip,
      vm_port: session.vm_port,
      vm_credentials: session.vm_credentials,
      guacURL
    });
  } catch (error) {
    console.error('Error starting race:', error);
    res.status(500).json({ error: 'Failed to start race' });
  }
});

// Get race session status
router.get('/session/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await DatabaseService.getRaceSession(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({
      status: session.status,
      vm_credentials: session.vm_credentials,
      created_at: session.created_at,
      updated_at: session.updated_at
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Stop a race session
router.post('/session/:id/stop', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // End the episode if it exists
    const episode = getEpisode(id);
    if (episode) {
      await episode.close();
      console.log(`Episode for session ${id} closed`);
    }

    const session = await DatabaseService.updateRaceSession(id, {
      status: 'expired',
      updated_at: new Date()
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error stopping session:', error);
    res.status(500).json({ error: 'Failed to stop session' });
  }
});

// Update race session status
router.put('/session/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'completed', 'expired'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const session = await DatabaseService.updateRaceSession(id, { status });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({
      status: session.status,
      vm_credentials: session.vm_credentials,
      created_at: session.created_at,
      updated_at: session.updated_at
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Submit feedback/race idea
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { raceIdea } = req.body;

    if (!raceIdea || typeof raceIdea !== 'string') {
      res.status(400).json({ error: 'Race idea is required' });
      return;
    }

    // Forward to webhook if configured
    const webhookUrl = process.env.FEEDBACK_WEBHOOK;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: `New Race Idea Submission:\n${raceIdea}`,
          timestamp: new Date().toISOString()
        })
      });
    }

    res.json({ success: true, message: 'Feedback received' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// List all race sessions
router.get('/history', async (req: Request, res: Response) => {
  try {
    const walletAddress = req.headers['x-wallet-address'] as string;
    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    const races = await DatabaseService.getRaceSessions({ address: walletAddress });
    if (!races) {
      res.status(404).json({ error: 'No races found' });
      return;
    }

    // Get training events for all sessions
    const enrichedRaces = await Promise.all(
      races.map(async (race) => {
        // Get all training events for this session
        const events = await TrainingEvent.find({ session: race._id });
        const actionTokens = events.length; // Total number of events

        // Get reward events with metadata
        const rewardEvents = events.filter(
          (event) =>
            event.type === 'reward' &&
            event.metadata &&
            typeof event.metadata.rewardValue === 'number' &&
            typeof event.metadata.scoreValue === 'number'
        );

        // Find first quest event for title
        const questEvent = events.find((event) => event.type === 'quest');
        const title = questEvent ? questEvent.message : `Race ${race.challenge}`;

        // Calculate earnings
        const earnings = rewardEvents.reduce((sum, event) => sum + event.metadata.rewardValue, 0);

        return {
          ...(race as any).toObject(),
          actionTokens,
          earnings,
          title
        };
      })
    );

    res.json(enrichedRaces);
  } catch (error) {
    console.error('Error fetching races:', error);
    res.status(500).json({ error: 'Failed to fetch races' });
  }
});

// Export training events for selected race sessions
router.post('/export', async (req: Request, res: Response) => {
  try {
    const { sessionIds } = req.body;
    if (!Array.isArray(sessionIds)) {
      res.status(400).json({ error: 'Session IDs array is required' });
      return;
    }

    console.log(`Exporting data for ${sessionIds.length} sessions:`, sessionIds);

    // Get all sessions first
    const sessions = await DatabaseService.getRaceSessionsByIds(sessionIds);
    if (!sessions) {
      res.status(404).json({ error: 'No sessions found' });
      return;
    }

    console.log(`Found ${sessions.length} sessions`);

    // Get all training events for the selected sessions
    const events = await Promise.all(
      sessions.map(async (session) => {
        console.log(`Processing session ${session._id}...`);

        const sessionEvents = await TrainingEvent.find({
          session: session._id
        }).sort({ timestamp: 1 }); // Sort by timestamp ascending

        console.log(`Found ${sessionEvents.length} events for session ${session._id}`);

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

    res.json(flatEvents);
  } catch (error) {
    console.error('Error exporting events:', error);
    res.status(500).json({ error: 'Failed to export events' });
  }
});

export { router as racesRoute };
