import express, { Request, Response, Router } from 'express';
import { Keypair } from '@solana/web3.js';
import OpenAI from 'openai';
import axios from 'axios';
import { TrainingPoolModel, TrainingPool, TrainingPoolStatus } from '../models/TrainingPool.js';
import { WalletConnectionModel } from '../models/WalletConnection.js';
import { ForgeRace } from '../models/ForgeRace.js';
import DatabaseService from '../services/db/index.js';

const FORGE_WEBHOOK = process.env.GYM_FORGE_WEBHOOK;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Track active race generation promises
const activeGenerations = new Map<string, Promise<void>>();

// Send webhook notification
async function notifyForgeWebhook(message: string) {
  if (!FORGE_WEBHOOK) return;
  
  try {
    await axios.post(FORGE_WEBHOOK, {
      content: message
    });
  } catch (error) {
    console.error('Error sending forge webhook:', error);
  }
}

// Generate races for a pool
async function generateRacesForPool(poolId: string, skills: string): Promise<void> {
  // Cancel any existing generation for this pool
  const existingPromise = activeGenerations.get(poolId);
  if (existingPromise) {
    console.log(`Canceling existing race generation for pool ${poolId}`);
    await notifyForgeWebhook(`🔄 Canceling existing race generation for pool ${poolId}`);
    // Let the existing promise continue but we'll ignore its results
    activeGenerations.delete(poolId);
  }

  // Start new generation
  let generationPromise: Promise<void>;
  generationPromise = (async () => {
    const pool = await TrainingPoolModel.findById(poolId);
    if (!pool) {
      throw new Error(`Pool ${poolId} not found`);
    }

    await notifyForgeWebhook(`🎬 Starting race generation for pool "${pool.name}" (${poolId})\nSkills: ${skills}`);
    try {
      // Delete existing races for this pool
      await ForgeRace.deleteMany({ pool_id: poolId });

      // Generate new races using OpenAI
      const prompt = RACE_GENERATION_PROMPT.replace('{skill list}', skills);
      const response = await openai.chat.completions.create({
        model: 'o3-mini',
        reasoning_effort: 'medium',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      } as any); // Type assertion to handle custom model params

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Only proceed if this is still the active generation
      if (activeGenerations.get(poolId) === generationPromise) {
          // Parse races from response
          const races = JSON.parse(content);
          
          // Store new races
          for (const race of races) {
            await ForgeRace.create({
              ...race,
              pool_id: poolId
            });
          }
          console.log(`Successfully generated races for pool ${poolId}`);
          await notifyForgeWebhook(`✅ Generated ${races.length} races for pool "${pool.name}" (${poolId})\n${races.map((r: {title: string}) => `- ${r.title}`).join('\n')}`);
      } else {
        console.log(`Race generation was superseded for pool ${poolId}`);
      }
    } catch (error) {
        const err = error as Error;
        console.error('Error generating races:', err);
        await notifyForgeWebhook(`❌ Error generating races for pool ${poolId}: ${err.message}`);
        throw err;
    } finally {
      // Clean up if this is still the active generation
      if (activeGenerations.get(poolId) === generationPromise) {
        activeGenerations.delete(poolId);
      }
    }
  })();

  // Store the promise
  activeGenerations.set(poolId, generationPromise);

  return generationPromise;
}

// Race generation prompt template
const RACE_GENERATION_PROMPT = `You are designing engaging "races" for the Training Gym, a platform where AI researchers contribute to computer-use datasets through guided demonstrations. Each race represents a type of computer task that users can record themselves completing.

Given a list of computer skills, generate race concepts. Each race should:
1. Focus on a clear theme or workflow (e.g., digital art, office productivity)
2. Incorporate related skills from the provided list
3. Be approachable for contributors while covering meaningful interactions
4. Have a catchy, memorable title that reflects its theme
5. Include a brief, engaging description (max 60 characters)
6. Be categorized based on its primary purpose or domain
7. Have an appropriate icon name from the Lucide icon set
8. Include a natural, conversational prompt that a user would send to their gym agent to generate personalized quests of this type

Output format should be a JSON list where each race follows this structure:
{
  "title": "Race Name",
  "description": "Brief engaging description",
  "category": "Category name",
  "icon": "IconName",
  "skills": ["Skill 1", "Skill 2"],
  "agent_prompt": "Hey, I was thinking of [activity related to skills] and wanted to record some training data. Could you create a quest that would help me practice [specific skills] while contributing to the dataset?"
}

Example race themes to consider:
- Data organization and cleanup workflows
- Creative content production
- System customization and optimization
- Document processing and conversion
- Media management and editing
- Browser optimization and setup

Focus on prompts that feel natural and conversational, as if a user is casually asking their personal gym agent to create a quest based on something they already wanted to do.

<SKILLS>
{skill list}
</SKILLS>

Output only the JSON list with no additional text or explanation.`;

const router: Router = express.Router();

interface ConnectBody {
  token: string;
  address: string;
}

interface CreatePoolBody {
  name: string;
  skills: string;
  token: {
    type: 'SOL' | 'VIRAL' | 'CUSTOM';
    symbol: string;
    address: string;
  };
  ownerAddress: string;
}

interface UpdatePoolBody {
  id: string;
  status?: TrainingPoolStatus.live | TrainingPoolStatus.paused;
  skills?: string;
}

interface ListPoolsBody {
  address: string;
}

interface GetRacesParams {
  poolId: string;
}

// Store wallet address for token
router.post('/connect', async (req: Request<{}, {}, ConnectBody>, res: Response) => {
  try {
    const { token, address } = req.body;

    if (!token || !address) {
      res.status(400).json({ error: 'Token and address are required' });
      return;
    }

    // Store connection token with address
    await WalletConnectionModel.updateOne({ token }, { token, address }, { upsert: true });

    res.json({ success: true });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({ error: 'Failed to connect wallet' });
  }
});

// Check connection status
router.get(
  '/check-connection',
  async (req: Request<{}, {}, {}, { token?: string }>, res: Response) => {
    try {
      const token = req.query.token;

      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      const connection = await WalletConnectionModel.findOne({ token });

      res.json({
        connected: !!connection,
        address: connection?.address
      });
    } catch (error) {
      console.error('Error checking connection:', error);
      res.status(500).json({ error: 'Failed to check connection status' });
    }
  }
);

// List training pools
router.post('/list', async (req: Request<{}, {}, ListPoolsBody>, res: Response) => {
  try {
    const { address } = req.body;

    console.log(address)
    if (!address) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }

    const pools = await TrainingPoolModel.find({ ownerAddress: address }).select(
      '-depositPrivateKey'
    ); // Exclude private key from response

    console.log(pools)

    // Update status to 'no-funds' if balance is 0
    const updatedPools = pools.map((pool) => {
      if (pool.funds === 0 && pool.status !== TrainingPoolStatus.noFunds) {
        pool.status = TrainingPoolStatus.noFunds;
        pool.save(); // Save the updated status
      }
      return pool;
    });

    res.json(updatedPools);
  } catch (error) {
    console.error('Error listing pools:', error);
    res.status(500).json({ error: 'Failed to list training pools' });
  }
});

// Create training pool
router.post('/create', async (req: Request<{}, {}, CreatePoolBody>, res: Response) => {
  try {
    const { name, skills, token, ownerAddress } = req.body;

    if (!name || !skills || !token || !ownerAddress) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Generate Solana keypair for deposit address
    const keypair = Keypair.generate();
    const depositAddress = keypair.publicKey.toString();
    const depositPrivateKey = Buffer.from(keypair.secretKey).toString('base64');

    const pool = new TrainingPoolModel({
      name,
      skills,
      token,
      ownerAddress,
      status: TrainingPoolStatus.noFunds,
      demonstrations: 0,
      funds: 0,
      depositAddress,
      depositPrivateKey
    });

    await pool.save();

    // Start initial race generation (non-blocking)
    generateRacesForPool(pool._id.toString(), skills).catch(error => {
      console.error('Error generating initial races:', error);
    });

    // Create response object without private key
    const { depositPrivateKey: _, ...response } = pool.toObject();

    res.json(response);
  } catch (error) {
    console.error('Error creating pool:', error);
    res.status(500).json({ error: 'Failed to create training pool' });
  }
});

// Update training pool
router.post('/update', async (req: Request<{}, {}, UpdatePoolBody>, res: Response) => {
  try {
    const { id, status, skills } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Pool ID is required' });
      return;
    }

    if (status && ![TrainingPoolStatus.live, TrainingPoolStatus.paused].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const pool = await TrainingPoolModel.findById(id);
    if (!pool) {
      res.status(404).json({ error: 'Training pool not found' });
      return;
    }

    // Only allow status update if funds > 0
    if (status && pool.funds === 0) {
      res.status(400).json({ error: 'Cannot update status: pool has no funds' });
      return;
    }

    const updates: Partial<TrainingPool> = {};
    if (status) updates.status = status;
    if (skills) updates.skills = skills;

    const updatedPool = await TrainingPoolModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).select('-depositPrivateKey'); // Exclude private key from response

    // If skills were updated, start race regeneration (non-blocking)
    if (skills) {
      generateRacesForPool(id, skills).catch(error => {
        console.error('Error regenerating races:', error);
      });
    }

    res.json(updatedPool);
  } catch (error) {
    console.error('Error updating pool:', error);
    res.status(500).json({ error: 'Failed to update training pool' });
  }
});

// Get all races
router.get('/races', async (_req: Request, res: Response) => {
  try {
    const races = await ForgeRace.find({}).populate('pool_id', 'name');
    res.json(races);
  } catch (error) {
    console.error('Error getting races:', error);
    res.status(500).json({ error: 'Failed to get races' });
  }
});

// Get races for a specific pool
router.get('/races/:poolId', async (req: Request<GetRacesParams>, res: Response) => {
  try {
    const { poolId } = req.params;

    if (!poolId) {
      res.status(400).json({ error: 'Pool ID is required' });
      return;
    }

    const races = await ForgeRace.find({ pool_id: poolId });
    res.json(races);
  } catch (error) {
    console.error('Error getting races:', error);
    res.status(500).json({ error: 'Failed to get races' });
  }
});

export { router as forgeRoute };
