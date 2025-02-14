import express, { Request, Response, Router } from 'express';
import { Keypair } from '@solana/web3.js';
import OpenAI from 'openai';
import axios from 'axios';
import { TrainingPoolModel, TrainingPool, TrainingPoolStatus } from '../models/TrainingPool.js';
import { WalletConnectionModel } from '../models/WalletConnection.js';
import { ForgeApp } from '../models/ForgeApp.js';
import DatabaseService from '../services/db/index.js';

const FORGE_WEBHOOK = process.env.GYM_FORGE_WEBHOOK;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Track active generation promises
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

// Generate apps for a pool
async function generateAppsForPool(poolId: string, skills: string): Promise<void> {
  // Cancel any existing generation for this pool
  const existingPromise = activeGenerations.get(poolId);
  if (existingPromise) {
    console.log(`Canceling existing app generation for pool ${poolId}`);
    await notifyForgeWebhook(`🔄 Canceling existing app generation for pool ${poolId}`);
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

    await notifyForgeWebhook(`🎬 Starting app generation for pool "${pool.name}" (${poolId})\nSkills: ${skills}`);
    try {
      // Delete existing apps for this pool
      await ForgeApp.deleteMany({ pool_id: poolId });

      // Generate new apps using OpenAI
      const prompt = APP_TASK_GENERATION_PROMPT.replace('{skill list}', skills);
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
          // Parse apps from response
          const apps = JSON.parse(content);
          
          // Store new apps
          for (const app of apps) {
            await ForgeApp.create({
              ...app,
              pool_id: poolId
            });
          }
          console.log(`Successfully generated apps for pool ${poolId}`);
          await notifyForgeWebhook(`✅ Generated ${apps.length} apps for pool "${pool.name}" (${poolId})\n${apps.map((a: {name: string}) => `- ${a.name}`).join('\n')}`);
      } else {
        console.log(`App generation was superseded for pool ${poolId}`);
      }
    } catch (error) {
        const err = error as Error;
        console.error('Error generating apps:', err);
        await notifyForgeWebhook(`❌ Error generating apps for pool ${poolId}: ${err.message}`);
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

// App task generation prompt template
const APP_TASK_GENERATION_PROMPT = `
You are designing natural task examples for various websites and apps to train AI assistants in helping users navigate digital services effectively.  

### **Instructions:**  
- Given a list of computer skills, generate **apps and their associated tasks** that naturally incorporate those skills.  
- Use **common digital services** unless a specific app/website is provided.  
- Each app should have at least **5 tasks** representing **real-world user interactions**.  
- Ensure **tasks align with the provided skills** rather than being random generic actions.  
- Be as exhaustive as possible, enumerating every relevant app and task given the input skill list.

### **Guidelines for Mapping Skills to Apps:**  

#### **1. Browser Management → Web Browsers (Chrome, Firefox, Edge, Safari, etc.)**
✅ **Examples:** Google Chrome, Mozilla Firefox, Microsoft Edge  
✅ **Tasks:**  
- "Change my default search engine to DuckDuckGo in Chrome."  
- "Restore all the tabs I accidentally closed in Firefox."  
- "Clear my browsing history and cookies in Edge."  
- "Save this webpage as a PDF in Safari."  
- "Install an ad blocker extension in Chrome."  

#### **2. Office Suite → Office Productivity Apps (Microsoft Office, Google Docs, LibreOffice, etc.)**
✅ **Examples:** Microsoft Word, Google Docs, LibreOffice Writer  
✅ **Tasks:**  
- "Format my document with proper headings in Word."  
- "Convert this DOCX file to PDF in Google Docs."  
- "Create a table with merged cells in LibreOffice Writer."  
- "Set up automatic spell check in Word."  
- "Insert a graph from an Excel sheet into my Google Docs file."  

#### **3. Email Client → Email Services (Gmail, Outlook, Thunderbird, etc.)**
✅ **Examples:** Gmail, Microsoft Outlook, Mozilla Thunderbird  
✅ **Tasks:**  
- "Set up an email signature in Outlook."  
- "Create a filter to move all newsletters to a specific folder in Gmail."  
- "Export my emails from Thunderbird to a backup file."  
- "Redirect incoming emails to a different address in Outlook."  
- "Organize my inbox by creating custom labels in Gmail."  

#### **4. Image Editing → Image Editors (Photoshop, GIMP, Canva, etc.)**
✅ **Examples:** Adobe Photoshop, GIMP, Canva  
✅ **Tasks:**  
- "Batch resize all these images in Photoshop."  
- "Convert a PNG file to JPG in GIMP."  
- "Apply a vintage filter to my photo in Canva."  
- "Enhance the resolution of a blurry image in Photoshop."  
- "Remove the background from this image in GIMP."  

#### **5. File Operations → File Management Apps (Windows File Explorer, macOS Finder, etc.)**
✅ **Examples:** Windows File Explorer, macOS Finder, WinRAR  
✅ **Tasks:**  
- "Compress these files into a ZIP folder using Windows File Explorer."  
- "Recover a deleted file from the Recycle Bin in macOS Finder."  
- "Extract this RAR archive using WinRAR."  
- "Batch rename all these files in Windows Explorer."  
- "Backup my documents to an external hard drive."  

#### **6. Code Editor → Development Environments (VS Code, Sublime Text, JetBrains, etc.)**
✅ **Examples:** Visual Studio Code, Sublime Text, JetBrains IntelliJ IDEA  
✅ **Tasks:**  
- "Install the Python extension in VS Code."  
- "Set up a dark theme in Sublime Text."  
- "Configure my workspace settings in JetBrains IntelliJ."  
- "Enable line numbers in Visual Studio Code."  
- "Use keyboard shortcuts to quickly navigate files in Sublime Text."  

### **Output Format (JSON list):**  
Output format should be a JSON list where each app follows this structure:
{
  "name": "App Name",
  "domain": "example.com",
  "description": "Brief service description",
  "categories": ["Category1", "Category2"],
  "tasks": [
    {
      "prompt": "Natural user request"
    }
  ]
}

Example categories to consider:
- Shopping
- Travel
- Delivery
- Entertainment
- Productivity
- Local Services
- Lifestyle
- News & Media

Focus on creating tasks that feel like genuine user requests, similar to:
- "Order dinner for my family of 4"
- "Book a hotel in Paris for next weekend"
- "Find running shoes under $100"
- "Schedule a cleaning service for tomorrow"

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

Remember to:
- Keep your initial request brief and natural
- Show mild confusion if technical terms are used
- Express appreciation when helped
- Stay focused on your specific task
- Ask for clarification if needed
- When provided context, do a tool call where in the content you must say hi and ask for your task directly (e.g. "Hi! I need to install an ad-blocker in Chrome" rather than "Can you guide me on how to install an ad-blocker?")`;

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
              content: "Hi! I need to find a hotel in Paris for my upcoming trip. Can you help me search on Booking.com?"
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
              content: "Hi! I'm hungry and want to order some sushi from Uber Eats. Can you show me how?"
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
              content: "Hi! I want to buy some tennis shoes on eBay. I've never used the site before - can you help me find a good deal?"
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

    console.log(JSON.stringify(apiMessages, null, 2));
    
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

    // Start initial app generation (non-blocking)
    generateAppsForPool(pool._id.toString(), skills).catch(error => {
      console.error('Error generating initial apps:', error);
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

    // If skills were updated, start app regeneration (non-blocking)
    if (skills) {
      generateAppsForPool(id, skills).catch(error => {
        console.error('Error regenerating apps:', error);
      });
    }

    res.json(updatedPool);
  } catch (error) {
    console.error('Error updating pool:', error);
    res.status(500).json({ error: 'Failed to update training pool' });
  }
});

// Get all apps
router.get('/apps', async (_req: Request, res: Response) => {
  try {
    const apps = await ForgeApp.find({}).populate('pool_id', 'name');
    res.json(apps);
  } catch (error) {
    console.error('Error getting apps:', error);
    res.status(500).json({ error: 'Failed to get apps' });
  }
});

export { router as forgeRoute };
