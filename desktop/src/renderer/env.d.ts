/// <reference types="svelte" />
import type { AgentMessage } from '@/shared/types';

interface Window {
    electronAPI: {
      takeScreenshot: () => Promise<{
        success: boolean;
        path?: string;
        error?: string;
      }>;
      runAgent: (message: string, screenshotPath: string) => Promise<{
        success: boolean;
        error?: string;
      }>;
      onAgentMessage: (callback: (message: AgentMessage) => void) => () => void;
    }
  }
