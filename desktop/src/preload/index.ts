const { contextBridge, ipcRenderer } = require('electron');

// Can't use import in preload script
interface AgentMessage {
  content: string;
  action?: {
    type: string;
    inputs: { [key: string]: string };
  };
}

// Channel names must match shared/types.ts
const IPC_CHANNELS = {
  TAKE_SCREENSHOT: 'take-screenshot',
  RUN_AGENT: 'run-agent',
  AGENT_MESSAGE: 'agent-message'
} as const;

// For debugging
console.log('[preload] Setting up IPC handlers');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', 
  {
    takeScreenshot: () => ipcRenderer.invoke(IPC_CHANNELS.TAKE_SCREENSHOT),
    runAgent: (message: string, screenshotPath: string) => 
      ipcRenderer.invoke(IPC_CHANNELS.RUN_AGENT, message, screenshotPath),
    onAgentMessage: (callback: (message: AgentMessage) => void) => {
      console.log('[preload] Setting up agent message listener');
      ipcRenderer.on(IPC_CHANNELS.AGENT_MESSAGE, (_: any, message: AgentMessage) => {
        console.log('[preload] Received agent message:', message);
        callback(message);
      });
      return () => {
        ipcRenderer.removeAllListeners(IPC_CHANNELS.AGENT_MESSAGE);
      };
    }
  }
);
