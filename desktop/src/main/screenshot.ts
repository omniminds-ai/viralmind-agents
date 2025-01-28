import type { IpcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';
import sharp from 'sharp';
import { Region, screen } from '@computer-use/nut-js';
import { WindowTracker } from './services/WindowTracker.js';
import type { ScreenshotResult } from '../shared/types.js';
import { IPC_CHANNELS } from '../shared/types.js';

// ESM replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const setupScreenshotHandlers = (ipcMain: IpcMain) => {
  ipcMain.handle(
    IPC_CHANNELS.TAKE_SCREENSHOT,
    async (): Promise<ScreenshotResult> => {
      try {
        // Ensure tmp directory exists
        const tmpDir = join(dirname(__dirname), '../tmp');
        await mkdir(tmpDir, { recursive: true });

        // Generate timestamp and filenames
        const timestamp = new Date().getTime().toString();
        const fileBaseName = `screenshot-${timestamp}`;
        const pngPath = join(tmpDir, `${fileBaseName}.png`);
        const jpgPath = join(tmpDir, `${fileBaseName}.jpg`);

        // Get last non-agent window info
        const lastWindow = WindowTracker.getInstance().getLastNonAgentWindow();
        if (!lastWindow) {
          throw new Error('No target window found');
        }
        
        const { title, region } = lastWindow;
        console.log('[screenshot] Target window:', title, region);

        // Take screenshot of target window region
        const { left, top, width, height } = region;
        console.log('[screenshot] Region:', { left, top, width, height });
        
        // Create region object for capture
        const captureRegion = new Region(left, top, width, height);
        
        // Capture the region directly to PNG file
        await screen.captureRegion(
          fileBaseName,
          captureRegion,
          undefined, // default PNG format
          dirname(pngPath) // use the same directory
        );
        
        // Convert PNG to JPG
        await sharp(pngPath)
          .jpeg({ quality: 90 })
          .toFile(jpgPath);

        // Return dimensions from the active window region
        console.log('[screenshot] Dimensions:', { width, height });

        return { 
          success: true, 
          path: jpgPath,
          width,
          height
        };
      } catch (error) {
        console.error('Screenshot error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  );
};
