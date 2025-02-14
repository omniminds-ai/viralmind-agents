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
router.get('/check-connection',
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
// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are playing the role of someone who needs help with a specific computer task. You should act as a realistic user who is not tech-savvy but friendly and appreciative. Stay in character and express your needs naturally and casually.

The computer-use agent (assistant) will guide you through using the specified app. They are helpful and friendly, typically starting responses with phrases like "Sure!", "I'll help you with that!", or "I can assist you with that".

Remember to:
- Keep your initial request brief and natural
- Show mild confusion if technical terms are used
- Express appreciation when helped
- Stay focused on your specific task
- Ask for clarification if needed
- When provided context, do a tool call where in the content you must say hi and ask for your task`;

interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

interface AppInfo {
  type: 'executable' | 'website';
  name: string;
  path?: string;
  url?: string;
}

interface ChatBody {
  messages: Message[];
  task_prompt: string;
  app: AppInfo;
}

// Sample few-shot conversation history
const FEW_SHOT_EXAMPLES = [
  {
    task_prompt: "Find a hotel in Paris",
    app: {
      type: "website",
      name: "Booking.com",
      url: "booking.com"
    },
    conversation: [
      {
        role: "user",
        content: "Task: Find a hotel in Paris\nApp: Booking.com (website, URL: booking.com)"
      },
      {
        role: "assistant",
        content: null,
        tool_calls: [{
          id: "call_123",
          type: "function",
          function: {
            name: "validate_task_request",
            arguments: JSON.stringify({
              title: "Find Paris hotel",
              app: "Booking.com",
              icon_url: "https://s2.googleusercontent.com/s2/favicons?domain=booking.com&sz=64",
              objectives: [
                "Open <app>Booking.com</app> website in your browser",
                "Search for Paris hotels",
                "Apply filters for dates and preferences",
                "View hotel details and reviews"
              ],
              content: "Hi! I'm planning a trip to Paris and need help finding a nice hotel. Could you show me how to search on Booking.com?"
            })
          }
        }]
      },
      {
        role: "tool",
        tool_call_id: "call_123",
        content: "accepted"
      },
      {
        role: "user",
        content: "Sure! I'll help you find a hotel in Paris. Let's start by going to booking.com and entering your travel dates. When are you planning to visit?"
      }
    ]
  },
  {
    task_prompt: "Order sushi delivery",
    app: {
      type: "website",
      name: "Uber Eats",
      url: "ubereats.com"
    },
    conversation: [
      {
        role: "user",
        content: "Task: Order sushi delivery\nApp: Uber Eats (website, URL: ubereats.com)"
      },
      {
        role: "assistant",
        content: null,
        tool_calls: [{
          id: "call_456",
          type: "function",
          function: {
            name: "validate_task_request",
            arguments: JSON.stringify({
              title: "Order sushi delivery",
              app: "Uber Eats",
              icon_url: "https://s2.googleusercontent.com/s2/favicons?domain=ubereats.com&sz=64",
              objectives: [
                "Open <app>Uber Eats</app> website in your browser",
                "Find nearby sushi restaurants",
                "Select items and customize order",
                "Review cart before checkout"
              ],
              content: "Hey there! I'm craving sushi and want to order delivery through Uber Eats. Could you help me place an order?"
            })
          }
        }]
      },
      {
        role: "tool",
        tool_call_id: "call_456",
        content: "accepted"
      },
      {
        role: "user",
        content: "I'll help you order sushi through Uber Eats! First, let's check which sushi restaurants deliver to your location. Could you open ubereats.com and enter your delivery address?"
      }
    ]
  },
  {
    task_prompt: "Find tennis shoes on sale",
    app: {
      type: "website",
      name: "eBay",
      url: "ebay.com"
    },
    conversation: [
      {
        role: "user",
        content: "Task: Find tennis shoes on sale\nApp: eBay (website, URL: ebay.com)"
      },
      {
        role: "assistant",
        content: null,
        tool_calls: [{
          id: "call_789",
          type: "function",
          function: {
            name: "validate_task_request",
            arguments: JSON.stringify({
              title: "Find tennis shoes",
              app: "eBay",
              icon_url: "https://s2.googleusercontent.com/s2/favicons?domain=ebay.com&sz=64",
              objectives: [
                "Open <app>eBay</app> website in your browser",
                "Search for tennis shoes",
                "Apply filters for size and price",
                "Sort and compare listings"
              ],
              content: "Hi! I need help finding some tennis shoes on sale on eBay. I've never really used the site before."
            })
          }
        }]
      },
      {
        role: "tool",
        tool_call_id: "call_789",
        content: "accepted"
      },
      {
        role: "user",
        content: "I'll help you find tennis shoes on eBay! Let's start by going to ebay.com. Do you have a specific brand or size in mind?"
      }
    ]
  }
];

// Add route to router
router.post('/chat', async (req: Request<{}, {}, ChatBody>, res: Response) => {
  try {
    const { messages, task_prompt, app } = req.body;

    if (!messages || !Array.isArray(messages) || !task_prompt || !app) {
      res.status(400).json({ error: 'Messages array, task prompt, and app info are required' });
      return;
    }

    // Format context message
    const contextMessage = `Task: ${task_prompt}\nApp: ${app.name} (${app.type}${
      app.type === 'executable' ? `, Path: ${app.path}` : `, URL: ${app.url}`
    })`;

    // Randomly select 3 few-shot examples
    const randomExamples = [...FEW_SHOT_EXAMPLES]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Prepare messages for OpenAI API
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      // Include all three random examples
      ...randomExamples.flatMap(example => example.conversation),
      { role: 'user', content: contextMessage },
      ...messages
    ];
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: apiMessages,
      tools: [{
        type: "function",
        function: {
          name: "validate_task_request",
          description: "Validate if the user's task request is appropriate and can be assisted with",
          parameters: {
            type: "object",
            required: ["title", "app", "objectives", "content"],
            properties: {
              title: {
                type: "string",
                description: "Brief title for the task"
              },
              app: {
                type: "string",
                description: "Name of the app being used"
              },
              icon_url: {
                type: "string",
                description: "URL for the app's favicon"
              },
              objectives: {
                type: "array",
                description: "List of 4 objectives to complete the task (first objective must be opening/navigating to the app with the app name wrapped in <app> tags, stop at checkout for purchases)",
                items: {
                  type: "string"
                }
              },
              content: {
                type: "string",
                description: "The assistant's message to the user"
              }
            }
          }
        }
      }]
    } as any);

    const assistantMessage = response.choices[0].message;
    console.log(assistantMessage)

    // Handle tool calls if present
    if (assistantMessage.tool_calls?.length) {
      const toolCall = assistantMessage.tool_calls[0];
      // Add tool call to response
      res.json({
        role: 'assistant',
        content: assistantMessage.content,
        tool_calls: [{
          id: toolCall.id,
          type: "function",
          function: {
            name: toolCall.function.name,
            arguments: toolCall.function.arguments
          }
        }]
      });
    } else {
      // Return regular message
      res.json({
        role: 'assistant',
        content: assistantMessage.content
      });
    }
  } catch (error) {
    console.error('Error handling chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

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
