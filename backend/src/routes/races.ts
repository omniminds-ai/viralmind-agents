import express, { Request, Response } from 'express';
import DatabaseService, { RaceSessionDocument } from '../services/db/index.ts';
import { GymVPSService } from '../services/gym-vps/index.ts';
import { getEpisode } from './socket.ts';
import GuacamoleService from '../services/guacamole/index.ts';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

import { TrainingEvent } from '../models/TrainingEvent.ts';
import { Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import BlockchainService from '../services/blockchain/index.ts';
import { VPSRegion } from '../services/gym-vps/types.ts';

async function generateQuest(
  imageUrl: string,
  prompt: string,
  session: RaceSessionDocument
) {
  try {
    console.log('Requesting quest!!');

    // Get treasury balance
    const treasuryBalance = await blockchainService.getTokenBalance(
      viralToken,
      treasuryKeypair.publicKey.toString()
    );

    // Calculate max reward
    const rng = Math.random();
    const maxReward = Math.ceil(Math.min(1 / rng, treasuryBalance / 128));

    console.log('Generating new quest for session:', session._id);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an AI assistant that needs to propose a new Ubuntu desktop quest based on the theme: "${prompt}". 
              
First, analyze the current screen state to understand what task the user has already completed. Then, propose a DIFFERENT task that fits the same theme but isn't repetitive.

For example, if the theme is "Draw cartoon characters in jspaint" and they drew a jellyfish, propose drawing a completely different character - not another jellyfish or a variation of it.

Return as JSON with these keys:
- reasoning: Analyze what's on screen and explain why you're choosing a different task within the same theme
- quest: The new specific task to complete (should match the theme but be distinct from what's visible)
- hint: Helpful tip for completing the new task`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 250
    });

    const jsonMatch = response.choices[0].message.content?.match(/{[\s\S]*}/);
    console.log(response.choices[0].message.content);
    if (jsonMatch && jsonMatch[0]) {
      const questData = JSON.parse(jsonMatch[0]);
      return {
        ...questData,
        maxReward
      };
    }

    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Error generating quest:', error);

    return {
      reasoning: 'Failed to analyze screen, providing a generic task within theme',
      quest: 'Open the Activities overview and launch a relevant application',
      hint: 'Press the Super (Windows) key or click Activities in the top-left corner',
      maxReward: 0
    };
  }
}

// Track sessions with pending transactions
const pendingTransactions = new Set<string>();

async function generateHint(
  imageUrl: string,
  currentQuest: string,
  prompt: string,
  session: RaceSessionDocument,
  maxReward: number,
  hintHistory: string[] = []
) {
  try {
    console.log("Requesting hint!!!");
    
    // Check for recent hint (within last 20 seconds)
    if (!session._id) {
      throw new Error('Session ID is missing');
    }

    const recentHint = await TrainingEvent.findOne(
      { 
        session: session._id, 
        type: 'hint',
        timestamp: { $gt: Date.now() - 20000 }
      },
      {},
      { sort: { timestamp: -1 } }
    );

    if (recentHint) {
      console.log('Using cached hint for session:', session._id, 'hint:', recentHint.message);
      return {
        hint: recentHint.message,
        reasoning: "Using cached hint",
        isCompleted: false,
        events: []
      };
    }

    // Get latest quest event (no time limit)
    const latestQuestEvent = await TrainingEvent.findOne(
      { 
        session: session._id, 
        type: 'quest'
      },
      {},
      { sort: { timestamp: -1 } }
    );

    // Must have a quest to generate hints
    if (!latestQuestEvent) {
      console.log('No quest found for session:', session._id);
      return {
        hint: "Please wait for quest to be generated...",
        reasoning: "No active quest found",
        isCompleted: false,
        events: []
      };
    }

    currentQuest = latestQuestEvent.message;
    maxReward = latestQuestEvent.metadata?.maxReward || 0;
    console.log('Using existing quest:', currentQuest);

    console.log('Generating new hint for session:', session._id, 'quest:', currentQuest);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Current quest: ${currentQuest}
Previous hints: ${hintHistory.slice(-3).join(', ')}

First, analyze if the core task has been completed. Focus only on the main objectives - ignore artistic style, specific colors, or minor visual details. For drawing tasks, consider them complete if the basic shape/object is recognizable.

Then provide a single actionable hint (if needed) that includes one of these patterns if applicable:
- Type 'x[TAB]' to autocomplete
- Scroll in [area] to find [target]
- Click the [specific element]
- Move cursor to [exact location]

Output as JSON with three fields:
1. "reasoning": Your analysis of what's been accomplished vs core requirements (ignore artistic details)
2. "isCompleted": Boolean based on basic task completion
3. "hint": A single sentence hint if not completed`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              },
            },
          ],
        },
      ],
      max_tokens: 250
    });

    const jsonMatch = response.choices[0].message.content?.match(/{[\s\S]*}/);
    console.log(response.choices[0].message.content);
    let parsedResponse = { hint: "", reasoning: "", isCompleted: false };    
    if (jsonMatch) {
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Error parsing JSON from response:', e);
      }
    }

    // If quest is completed and no pending transaction, process reward
    if (parsedResponse.isCompleted && !pendingTransactions.has(session._id.toString())) {
      try {
        // Mark this session as having a pending transaction
        if (!session._id) {
          throw new Error('Session ID is missing');
        }
        pendingTransactions.add(session._id.toString());

        // Calculate actual reward
        const score = Math.random();
        const actualReward = Math.ceil(maxReward * score);

        // Transfer reward from treasury
        const signature = await blockchainService.transferToken(
          viralToken,
          actualReward,
          treasuryKeypair,
          session.address
        );

        // Create reward event
        const rewardEvent = {
          type: "reward",
          message: `The judge rewarded you ${actualReward.toFixed(
            2
          )} $VIRAL for this (${(score * 100).toFixed(0)}% of ${maxReward.toFixed(
            2
          )})${signature ? `\nTransaction: ${signature}` : ""}`,
          session: session._id!,
          frame: 0,
          timestamp: Date.now(),
          metadata: {
            scoreValue: score,
            rewardValue: actualReward,
            transaction: signature,
          },
        };
        await DatabaseService.createTrainingEvent(rewardEvent);

        // Generate new quest
        console.log('Quest completed! Generating new quest...');
        const questData = await generateQuest(imageUrl, prompt, session);
        const questEvent = {
          type: "quest",
          message: questData.quest,
          session: session._id!,
          frame: 0,
          timestamp: Date.now(),
          metadata: {
            maxReward: questData.maxReward,
          },
        };
        await DatabaseService.createTrainingEvent(questEvent);

        // Clear pending transaction flag
        if (session._id) {
          pendingTransactions.delete(session._id.toString());
        }

        return {
          hint: parsedResponse.hint,
          reasoning: parsedResponse.reasoning,
          isCompleted: true,
          newQuest: questData.quest,
          maxReward: questData.maxReward,
          events: [rewardEvent, questEvent]
        };
      } catch (error) {
        // Clear pending transaction flag on error
        if (session._id) {
          pendingTransactions.delete(session._id.toString());
        }
        throw error;
      }
    } else if (parsedResponse.isCompleted) {
      // If quest is completed but transaction is pending, return special message
      return {
        hint: "Processing reward... please wait",
        reasoning: "Transaction in progress",
        isCompleted: false,
        events: []
      };
    }

    // Create hint and reasoning events
    const hintEvent = {
      type: 'hint',
      message: parsedResponse.hint || '(empty)',
      session: session._id,
      frame: 0,
      timestamp: Date.now()
    };
    await DatabaseService.createTrainingEvent(hintEvent);

    const reasoningEvent = {
      type: 'reasoning',
      message: parsedResponse.reasoning || '(empty)',
      session: session._id,
      frame: 0,
      timestamp: Date.now()
    };
    await DatabaseService.createTrainingEvent(reasoningEvent);

    return {
      hint: parsedResponse.hint,
      reasoning: parsedResponse.reasoning,
      isCompleted: false,
      events: [hintEvent, reasoningEvent]
    };
  } catch (error) {
    console.error("Error generating hint:", error);
    const fallbackHint = "Scroll in the environments list to explore available tasks";
    
    if (!session._id) {
      throw new Error('Session ID is missing');
    }
    
    const errorEvent = {
      type: 'hint',
      message: fallbackHint,
      session: session._id,
      frame: 0,
      timestamp: Date.now()
    };
    await DatabaseService.createTrainingEvent(errorEvent);

    return {
      hint: fallbackHint,
      reasoning: 'Error occurred during analysis',
      isCompleted: false,
      events: [errorEvent]
    };
  }
}

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
    const { address, region } = req.body;

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

    // get vps region programatically
    let regionEnum: VPSRegion = VPSRegion.us_east;
    if (region?.includes('us-east')) regionEnum = VPSRegion.us_east;
    if (region?.includes('us-west')) regionEnum = VPSRegion.us_west;
    if (region?.includes('eu-central')) regionEnum = VPSRegion.eu_central;
    const instance = await DatabaseService.getGymVPS(regionEnum);
    const vpsService = new GymVPSService({
      ip: instance.ip,
      username: instance.username,
      privateKey: instance.ssh_keypair.private
    });
    const vps = await vpsService.initNewTrainer(address);

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

// Request a hint for current quest
router.post('/session/:id/hint', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await DatabaseService.getRaceSession(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (!session.vm_credentials?.guacToken || !session.vm_credentials?.guacClientId) {
      res.status(400).json({ error: 'Session missing Guacamole credentials' });
      return;
    }

    // Get screenshot from request body
    const { screenshot } = req.body;
    if (!screenshot) {
      res.status(400).json({ error: 'Screenshot data is required' });
      return;
    }

    // Create a proper image URL for OpenAI
    const imageUrl = screenshot;

    // Get current quest from latest quest event
    const latestQuestEvent = await TrainingEvent.findOne(
      { session: id, type: 'quest' },
      {},
      { sort: { timestamp: -1 } }
    );

    // Get hint history
    const hintEvents = await TrainingEvent.find(
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
        type: "quest",
        message: questData.quest,
        session: id,
        frame: 0,
        timestamp: Date.now(),
        metadata: {
          maxReward: questData.maxReward,
        },
      };
      await DatabaseService.createTrainingEvent(questEvent);
      console.log('Generated initial quest:', questData.quest);

      // Create initial hint event
      const hintEvent = {
        type: "hint",
        message: questData.hint,
        session: id,
        frame: 0,
        timestamp: Date.now(),
      };
      await DatabaseService.createTrainingEvent(hintEvent);

      res.json({
        quest: questData.quest,
        hint: questData.hint,
        maxReward: questData.maxReward,
        events: [questEvent, hintEvent]
      });
    }

    console.log('Current quest:', latestQuestEvent!.message);
    console.log('Previous hints:', hintHistory);

    const result = await generateHint(
      imageUrl,
      latestQuestEvent!.message,
      session.prompt,
      session,
      maxReward,
      hintHistory
    );

    // Return events for frontend to process
    res.json(result);
  } catch (error) {
    console.error('Error generating hint:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

// Generate initial quest for session
router.post('/session/:id/quest', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await DatabaseService.getRaceSession(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (!session.vm_credentials?.guacToken || !session.vm_credentials?.guacClientId) {
      res.status(400).json({ error: 'Session missing Guacamole credentials' });
      return;
    }

    // Get screenshot from request body
    const { screenshot } = req.body;
    if (!screenshot) {
      res.status(400).json({ error: 'Screenshot data is required' });
      return;
    }

    // Create a proper image URL for OpenAI
    const imageUrl = screenshot;

    const questData = await generateQuest(imageUrl, session.prompt, session);
    
    // Create quest event
    const questEvent = {
      type: 'quest',
      message: questData.quest,
      session: id,
      frame: 0,
      timestamp: Date.now(),
      metadata: {
        maxReward: questData.maxReward
      }
    };
    await DatabaseService.createTrainingEvent(questEvent);

    // Create hint event
    const hintEvent = {
      type: 'hint',
      message: questData.hint,
      session: id,
      frame: 0,
      timestamp: Date.now()
    };
    await DatabaseService.createTrainingEvent(hintEvent);

    res.json({
      quest: questData.quest,
      hint: questData.hint,
      maxReward: questData.maxReward,
      events: [questEvent, hintEvent]
    });
  } catch (error) {
    console.error('Error generating quest:', error);
    res.status(500).json({ error: 'Failed to generate quest' });
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
