import { getActiveWindow } from '@computer-use/nut-js';
import type { Region } from '@computer-use/nut-js';

export class WindowTracker {
  private static instance: WindowTracker;
  private lastNonAgentWindow: {
    title: string;
    region: Region;
  } | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly POLL_INTERVAL = 500; // 500ms polling interval

  private constructor() {
    // Don't start polling in constructor
  }

  public static getInstance(): WindowTracker {
    if (!WindowTracker.instance) {
      WindowTracker.instance = new WindowTracker();
    }
    return WindowTracker.instance;
  }

  private async updateActiveWindow() {
    try {
      const windowRef = await getActiveWindow();
      const title = await windowRef.title;
      
      // Skip if it's our agent window
      if (title.includes('GUI Agent Chat')) {
        return;
      }

      // Only update and log if title is different
      if (!this.lastNonAgentWindow || this.lastNonAgentWindow.title !== title) {
        const region = await windowRef.region;
        this.lastNonAgentWindow = { title, region };
        console.log('[WindowTracker] Updated last window:', { title, region });
      } else {
        // Just update region if title is the same
        this.lastNonAgentWindow.region = await windowRef.region;
      }
    } catch (error) {
      console.error('[WindowTracker] Error updating window:', error);
    }
  }

  private startPolling() {
    if (this.pollingInterval) {
      return;
    }

    this.pollingInterval = setInterval(async () => {
      this.updateActiveWindow();
    }, this.POLL_INTERVAL);

    console.log('[WindowTracker] Started polling');
  }

  public cleanup() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('[WindowTracker] Stopped polling');
    }
  }

  public init() {
    this.startPolling();
    console.log('[WindowTracker] Initialized');
  }

  public getLastNonAgentWindow() {
    return this.lastNonAgentWindow;
  }
}
