export interface ActionInputs {
    [key: string]: string;
}

export interface PredictionParsed {
    reflection: string;
    thought: string;
    action_type: string;
    action_inputs: ActionInputs;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    screenshot?: string;
    action?: {
        type: string;
        inputs: ActionInputs;
    };
}

export interface ScreenshotResult {
    success: boolean;
    path?: string;
    error?: string;
    width?: number;
    height?: number;
}

export interface AgentResult {
    success: boolean;
    response?: string;
    error?: string;
    screenWidth?: number;
    screenHeight?: number;
}

// IPC channel names
export const IPC_CHANNELS = {
    TAKE_SCREENSHOT: 'take-screenshot',
    RUN_AGENT: 'run-agent',
    AGENT_MESSAGE: 'agent-message'
} as const;

export interface IpcMainHandlers {
    [IPC_CHANNELS.TAKE_SCREENSHOT]: () => Promise<ScreenshotResult>;
    [IPC_CHANNELS.RUN_AGENT]: (message: string, screenshotPath: string) => Promise<AgentResult>;
}

export interface AgentMessage {
    content: string;
    action?: {
        type: string;
        inputs: ActionInputs;
    };
}

// Base types for IPC responses
export type BaseScreenshotResult = {
    success: boolean;
    path?: string;
    error?: string;
}

export type BaseAgentResult = {
    success: boolean;
    response?: string;
    error?: string;
}

// Extended types with additional properties
export interface ScreenshotResult extends BaseScreenshotResult {
    width?: number;
    height?: number;
}

export interface AgentResult extends BaseAgentResult {
    screenWidth?: number;
    screenHeight?: number;
}

// For preload
declare global {
    interface Window {
        electronAPI: {
            takeScreenshot: () => Promise<BaseScreenshotResult>;
            runAgent: (message: string, screenshotPath: string) => Promise<BaseAgentResult>;
            onAgentMessage: (callback: (message: AgentMessage) => void) => () => void;
        };
    }
}
