import express, { Request, Response } from 'express';
import DatabaseService from '../services/db/index.ts';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
import { TrainingEvent } from '../models/TrainingEvent.ts';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Track sessions with hint generation in progress
const generatingHints = new Set<string>();

async function generateQuest(imageUrl: string, installed_applications: string, prompt: string, sessionId: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'o3-mini',
      reasoning_effort: 'medium',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `DESKTOP TASK GENERATION PROMPT
Convert abstract computer usage instructions into concrete, reproducible scenarios.

INPUT:
1. INSTALLED_APPLICATIONS: ${installed_applications}
2. INSTRUCTION: ${prompt}

OUTPUT:
{
   "task_id": "unique_identifier", 
   "title": "3-4 word action summary",
   "original_instruction": "Raw instruction text",
   "concrete_scenario": "Specific context using real-world examples",
   "objective": "One sentence with specific terms (no words like 'current' or 'this')",
   "relevant_applications": ["Only apps from INSTALLED_APPLICATIONS"],
   "subgoals": [
       "Concise, specific steps",
       "No obvious explanations",
       "No UI element descriptions unless ambiguous"
   ]
}

RULES:
- Keep subgoals brief and clear
- For web tasks, use real websites in these categories:

HEALTH & MEDICAL:
- Reference: drugs.com, webmd.com, mayoclinic.org, medlineplus.gov
- Insurance: uhc.com, cigna.com, anthem.com, aetna.com
- Pharmacy: cvs.com, walgreens.com, riteaid.com
- Telemedicine: teladoc.com, doctor-on-demand.com, mdlive.com

TRAVEL:
- Airlines: delta.com, united.com, aa.com, southwest.com
- Hotels: marriott.com, hilton.com, ihg.com
- Booking: expedia.com, kayak.com, booking.com
- Car Rental: enterprise.com, hertz.com, avis.com

SHOPPING:
- General: amazon.com, walmart.com, target.com, ebay.com
- Electronics: bestbuy.com, newegg.com
- Fashion: nordstrom.com, macys.com, zara.com
- Home: wayfair.com, ikea.com, homedepot.com
- Pet: chewy.com, petco.com, petsmart.com

FOOD:
- Delivery: doordash.com, ubereats.com, grubhub.com
- Grocery: instacart.com, freshdirect.com, walmart.com/grocery
- Restaurant Booking: opentable.com, resy.com
- Recipe: allrecipes.com, foodnetwork.com, epicurious.com

ENTERTAINMENT:
- Streaming: netflix.com, hulu.com, disney.com, hbomax.com
- Music: spotify.com, pandora.com, apple.com/music
- Gaming: steam.com, epicgames.com, xbox.com
- Events: ticketmaster.com, stubhub.com, eventbrite.com

SOCIAL/COMMUNICATION:
- Social: facebook.com, instagram.com, twitter.com, linkedin.com
- Video: youtube.com, vimeo.com, twitch.tv
- Email: gmail.com, outlook.com, yahoo.com
- Chat: whatsapp.com, telegram.org, discord.com

PRODUCTIVITY:
- Work: slack.com, zoom.us, microsoft365.com, webex.com
- Cloud: dropbox.com, drive.google.com, box.com
- Documents: docs.google.com, office.com
- Notes: evernote.com, notion.so, onenote.com

INFORMATION:
- News: cnn.com, bbc.com, reuters.com, apnews.com
- Reference: wikipedia.org, stackoverflow.com, quora.com
- Weather: weather.com, accuweather.com, wunderground.com
- Maps: google.com/maps, waze.com, openstreetmap.org
- Education: coursera.org, udemy.com, khanacademy.org

FINANCE:
- Banking: chase.com, bankofamerica.com, wellsfargo.com
- Investment: fidelity.com, vanguard.com, schwab.com
- Payment: paypal.com, venmo.com, cashapp.com
- Crypto: coinbase.com, binance.com
- Tax: turbotax.com, hrblock.com

GOVERNMENT & UTILITIES:
- Government: irs.gov, ssa.gov, usps.com
- Utilities: pay bills via local utility websites
- DMV: dmv.org and state-specific DMV sites
- Benefits: benefits.gov, medicare.gov

RULES:
- No made-up or hypothetical URLs
- No referential terms ('current', 'this', 'desired')
- Only use applications from input list
- Each step must be independently actionable
- Skip obvious explanations
- Focus on key actions`
            }
            // {
            //   type: 'image_url',
            //   image_url: { url: imageUrl }
            // }
          ]
        }
      ],
      // max_tokens: 500
    });

    const jsonMatch = response.choices[0].message.content?.match(/{[\s\S]*}/);
    if (jsonMatch && jsonMatch[0]) {
      const questData = JSON.parse(jsonMatch[0]);
      return questData;
    }

    throw new Error('No valid JSON found in response');
  } catch (error) {
    if ((error as Error).message.includes('Invalid MIME type')) {
      console.log('Error generating quest: Invalid MIME type. Likely tried to send an empty frame.');
    } else {
      console.error('Error generating quest:', error);
    }

    return {
      task_id: randomBytes(16).toString('hex'),
      title: "Generic Desktop Task",
      original_instruction: "Generate fallback task",
      concrete_scenario: "Complete a basic computer operation",
      objective: "Perform a simple task using available applications",
      relevant_applications: [],
      subgoals: ["Open an application", "Complete basic operation"]
    };
  }
}

async function generateHint(
  imageUrl: string,
  installed_applications: string, 
  currentQuest: string,
  prompt: string,
  sessionId: string,
  hintHistory: string[] = []
) {
  try {
    // Check if hint is already being generated for this session
    if (generatingHints.has(sessionId)) {
      console.log('Hint generation already in progress for session:', sessionId);
      return {
        hint: 'Please wait, generating hint...',
        reasoning: 'Hint generation in progress',
        isCompleted: false,
        events: []
      };
    }

    // Mark this session as generating a hint
    generatingHints.add(sessionId);

    const recentHint = await TrainingEvent.findOne(
      {
        session: sessionId,
        type: 'hint',
        timestamp: { $gt: Date.now() - 10000 }
      },
      {},
      { sort: { timestamp: -1 } }
    );

    if (recentHint) {
      return {
        hint: recentHint.message,
        reasoning: 'Using cached hint',
        isCompleted: false,
        events: []
      };
    }

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

First, analyze if the core task has been completed. Focus only on the main objectives - ignore artistic style, specific colors, or minor visual details.

Then provide a single actionable hint (if needed) that helps guide the user toward completing the task.

Output as JSON with three fields:
1. "reasoning": Your analysis of what's been accomplished vs core requirements
2. "isCompleted": Boolean based on basic task completion
3. "hint": A single sentence hint if not completed`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 250
    });

    const jsonMatch = response.choices[0].message.content?.match(/{[\s\S]*}/);
    let parsedResponse = { hint: '', reasoning: '', isCompleted: false };
    if (jsonMatch) {
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Error parsing JSON from response:', e);
      }
    }

    // If quest is completed, generate new quest
    if (parsedResponse.isCompleted) {
      console.log('Quest completed! Generating new quest...');
      const questData = await generateQuest(imageUrl, installed_applications, prompt, sessionId);
      const questEvent = {
        type: 'quest',
        message: questData.quest,
        session: sessionId,
        frame: 0,
        timestamp: Date.now()
      };
      await DatabaseService.createTrainingEvent(questEvent);

      return {
        hint: parsedResponse.hint,
        reasoning: parsedResponse.reasoning,
        isCompleted: true,
        newQuest: questData.quest,
        events: [questEvent]
      };
    }

    // Create hint and reasoning events
    const hintEvent = {
      type: 'hint',
      message: parsedResponse.hint || '(empty)',
      session: sessionId,
      frame: 0,
      timestamp: Date.now()
    };
    await DatabaseService.createTrainingEvent(hintEvent);

    const reasoningEvent = {
      type: 'reasoning',
      message: parsedResponse.reasoning || '(empty)',
      session: sessionId,
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
    console.error('Error generating hint:', error);
    const fallbackHint = 'Try a different approach to complete the task';

    const errorEvent = {
      type: 'hint',
      message: fallbackHint,
      session: sessionId,
      frame: 0,
      timestamp: Date.now()
    };
    await DatabaseService.createTrainingEvent(errorEvent);

    // Clear generating hint flag on error
    generatingHints.delete(sessionId);

    return {
      hint: fallbackHint,
      reasoning: 'Error occurred during analysis',
      isCompleted: false,
      events: [errorEvent]
    };
  } finally {
    // Always clear the generating hint flag
    generatingHints.delete(sessionId);
  }
}

const router = express.Router();

// Request a quest/hint
router.post('/quest', async (req: Request, res: Response) => {
  try {
    const { screenshot, address, prompt, installed_applications } = req.body;

    if (!screenshot || !address || !prompt) {
      res.status(400).json({ error: 'Screenshot, address and prompt are required' });
      return;
    }

    // Create or get session
    let session = await DatabaseService.getGymSession(address);
    if (!session) {
      const newSession = await DatabaseService.createGymSession({
        address,
        status: 'active' as const,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      if (!newSession) {
        res.status(500).json({ error: 'Failed to create session' });
        return;
      }
      
      session = newSession;
    }

    const sessionId = session._id?.toString();
    if (!sessionId) {
      res.status(500).json({ error: 'Invalid session ID' });
      return;
    }

    // Store latest screenshot in session metadata
    await DatabaseService.updateGymSession(sessionId, {
      preview: screenshot,
      updated_at: new Date()
    });

    // Get current quest from latest quest event
    const latestQuestEvent = await TrainingEvent.findOne(
      { session: sessionId, type: 'quest' },
      {},
      { sort: { timestamp: -1 } }
    );

    // Get hint history
    const hintEvents = await TrainingEvent.find(
      { session: sessionId, type: 'hint' },
      { message: 1 },
      { sort: { timestamp: -1 }, limit: 3 }
    );
    const hintHistory = hintEvents.map((e) => e.message);


    const questData = await generateQuest(screenshot, installed_applications || '', prompt, sessionId);

    res.json(questData);
    // If no quest exists, generate initial quest
  //   if (!latestQuestEvent) {
  //     console.log('No quest found for session:', sessionId, 'generating initial quest...');
  //     const questData = await generateQuest(screenshot, installed_applications || '', prompt, sessionId);
  //     const questEvent = {
  //       type: 'quest',
  //       message: JSON.stringify(questData),
  //       session: sessionId,
  //       frame: 0,
  //       timestamp: Date.now()
  //     };
  //     await DatabaseService.createTrainingEvent(questEvent);

  //     res.json({
  //       quest: questData,
  //       events: [questEvent]
  //     });
  //   } else {
  //     // Generate hint for existing quest
  //     const result = await generateHint(
  //       screenshot,
  //       installed_applications || '', 
  //       latestQuestEvent.message,
  //       prompt,
  //       sessionId,
  //       hintHistory
  //     );

  //     res.json(result);
  //   }
  } catch (error) {
    console.error('Error handling quest/hint request:', error);
    res.status(500).json({ error: 'Failed to handle quest/hint request' });
  }
});

export { router as gymRoute };
