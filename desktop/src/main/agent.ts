import { IpcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile, mkdir } from 'fs/promises';
import dotenv from 'dotenv';
import type { AgentResult, PredictionParsed } from '../shared/types.js';
import { IPC_CHANNELS } from '../shared/types.js';
import OpenAI from 'openai';
import { WindowTracker } from './services/WindowTracker.js';
import { UIModel } from './models/UIModel.js';
import { GymModel } from './models/GymModel.js';

import { resizeImage } from './utils/image.js';
import { Region, screen } from '@computer-use/nut-js';
import sharp from 'sharp';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(dirname(__dirname), '../.env') });

const MODEL = process.env.VITE_MODEL;
const ENDPOINT_URL = process.env.VITE_ENDPOINT_URL;
const API_KEY = process.env.VITE_API_KEY;
const ACTION_SPACE = process.env.VITE_PROVIDER;

if (!ENDPOINT_URL || !API_KEY) {
  throw new Error('Missing required environment variables');
}

const client = new OpenAI({
  baseURL: ENDPOINT_URL,
  apiKey: API_KEY
});

const uiModel = 
  ACTION_SPACE == 'uground' ? new UIModel(client, MODEL!) :
  ACTION_SPACE == 'gym' ? new GymModel(client, MODEL!) :
  new GymModel(client, MODEL!);

export const setupAgentHandlers = (ipcMain: IpcMain, mainWindow: Electron.BrowserWindow) => {
  ipcMain.handle(
    IPC_CHANNELS.RUN_AGENT,
    async (_, message: string, screenshotPath: string): Promise<AgentResult> => {
      try {
        // For now, we're just using the UI model
        // In the future, this will be extended to use reasoning models
        // and handle structured data/action grounding
        
        if (!screenshotPath) {
          throw new Error('Screenshot is required for UI model');
        }

        // Get last non-agent window info
        const lastWindow = WindowTracker.getInstance().getLastNonAgentWindow();
        if (!lastWindow) {
          throw new Error('No target window found');
        }
        
        const { region } = lastWindow;
        const resizedImageBuffer = await resizeImage(screenshotPath);
        const base64Image = resizedImageBuffer.toString('base64');
        
        // Use the target window dimensions for coordinate scaling
        const { width: screenWidth = 1920, height: screenHeight = 1080 } = region;
        console.log('[agent] Using window dimensions:', { screenWidth, screenHeight });

        // Run the agent loop
        await uiModel.runAgentLoop(
          message, 
          base64Image, 
          async (prediction) => {
            // Send message with action, only include content if there's a thought
            const message = {
              content: prediction.thought?.trim() || '',
              action: {
                type: prediction.action_type,
                inputs: prediction.action_inputs
              }
            };
            console.log('[agent] Sending message:', message);
            mainWindow.webContents.send(IPC_CHANNELS.AGENT_MESSAGE, message);

            // Execute the action
            await uiModel.execute({
              prediction,
              screenWidth,
              screenHeight
            });
          },
          async () => {
            // Take a new screenshot
            const tmpDir = join(dirname(__dirname), '../tmp');
            await mkdir(tmpDir, { recursive: true });

            const timestamp = new Date().getTime().toString();
            const fileBaseName = `screenshot-${timestamp}`;
            const pngPath = join(tmpDir, `${fileBaseName}.png`);
            const jpgPath = join(tmpDir, `${fileBaseName}.jpg`);

            // Take screenshot of target window region
            const { left, top, width, height } = region;
            const captureRegion = new Region(left, top, width, height);
            await screen.captureRegion(fileBaseName, captureRegion, undefined, dirname(pngPath));
            
            // Convert PNG to JPG
            await sharp(pngPath).jpeg({ quality: 90 }).toFile(jpgPath);
            
            // Resize and return base64
            const newBuffer = await resizeImage(jpgPath);
            return newBuffer.toString('base64');
          }
        );

        return {
          success: true,
          screenWidth,
          screenHeight
        };
      } catch (error) {
        console.error('Agent error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  );
};
