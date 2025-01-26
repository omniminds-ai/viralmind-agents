export interface RawSession {
    _id: { $oid: string };
    address: string;
    challenge: string;
    prompt: string;
    category: string;
    vm_ip: string;
    vm_port: number;
    vm_password: string;
    vm_region: string;
    vm_credentials: {
        guacToken: string;
        guacConnectionId: string;
        guacClientId: string;
        username: string;
        password: string;
    };
    status: string;
    created_at: { $date: string };
}

export interface RawEventsFile {
    session_id: string;
    challenge: string;
    category: string;
    transaction_signature: string;
    timestamp?: number;
    events: RawEvent[];
}

export interface RawEvent {
    type: 'quest' | 'hint';
    timestamp: number;
    message?: string;
    frame?: number;
}

export interface GuacInstruction {
    opcode: string;
    args: string[];
    timestamp: number;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface ProcessedEvent {
    type: 'keydown' | 'keyup' | 'mousedown' | 'mouseup' | 'mousedrag' | 'frame' | 'quest' | 'hint';
    timestamp: number;
    data: {
        x?: number;
        y?: number;
        keyCode?: number;
        text?: string;
        frame?: string;
        message?: string;
        coordinates?: Array<{
            time: number;  // relative ms from start of drag
            x: number;
            y: number;
        }>;
    };
}

export interface PipelineStage<T, U> {
    process(input: T): Promise<U>;
}

export interface PipelineConfig {
    dataDir: string;
    outputDir: string;
    sessionIds: string[];
    stages: PipelineStage<any, any>[];
}
