import fs from 'fs';
import path from 'path';
import { GuacInstruction, PipelineStage, ProcessedEvent } from '../../shared/types';

export class GuacExtractor implements PipelineStage<string, ProcessedEvent[]> {
    constructor(private dataDir: string) {}
    
    private parseLength(text: string): [string | null, string] {
        const match = text.match(/^(\d+)\.(.*)/);
        if (!match) return [null, text];

        const length = parseInt(match[1]);
        const remaining = match[2];
        if (remaining.length < length) return [null, text];

        return [remaining.slice(0, length), remaining.slice(length)];
    }

    private parseInstructions(content: string): GuacInstruction[] {
        const instructions: GuacInstruction[] = [];
        const raw = content.split(';');
        let currentTimestamp = 0;
        let firstSyncTimestamp: number | null = null;

        for (const chunk of raw) {
            if (!chunk.trim()) continue;

            const parts = chunk.trim().split(',');
            if (!parts.length) continue;

            const [opcode] = this.parseLength(parts[0]);
            if (!opcode) continue;

            const args = parts.slice(1).map(part => {
                const [value] = this.parseLength(part);
                return value || '';
            }).filter(Boolean);

            // Update timestamp from sync instructions
            if (opcode === 'sync') {
                const syncTime = parseInt(args[0]);
                if (firstSyncTimestamp === null) {
                    firstSyncTimestamp = syncTime;
                }
                currentTimestamp = syncTime - (firstSyncTimestamp || 0);
            }

            instructions.push({ opcode, args, timestamp: currentTimestamp });
        }

        return instructions;
    }

    private processKeyboardEvents(instructions: GuacInstruction[]): ProcessedEvent[] {
        const events: ProcessedEvent[] = [];

        for (const instruction of instructions) {
            if (instruction.opcode !== 'key' || instruction.args.length < 2) continue;

            const [keyCode, pressed] = instruction.args;
            const code = parseInt(keyCode);
            
            events.push({
                type: pressed === '1' ? 'keydown' : 'keyup',
                timestamp: instruction.timestamp,
                data: {
                    keyCode: code,
                    text: code >= 32 && code <= 126 ? String.fromCharCode(code) : undefined
                }
            });
        }

        return events;
    }

    private processMouseEvents(instructions: GuacInstruction[]): ProcessedEvent[] {
        const events: ProcessedEvent[] = [];
        let dragStartTime: number | null = null;
        let dragCoordinates: Array<{time: number, x: number, y: number}> = [];
        let lastButtonState = '0';

        for (const instruction of instructions) {
            if (instruction.opcode !== 'mouse' || instruction.args.length < 3) continue;

            const x = parseInt(instruction.args[0]);
            const y = parseInt(instruction.args[1]);
            const currentButtonState = instruction.args[2];

            // Detect button state changes
            if (currentButtonState === '1' && lastButtonState === '0') {
                // Button just pressed - start new drag
                dragStartTime = instruction.timestamp;
                dragCoordinates = [{time: 0, x, y}];
                events.push({
                    type: 'mousedown',
                    timestamp: instruction.timestamp,
                    data: { x, y }
                });
            } else if (currentButtonState === '0' && lastButtonState === '1') {
                // Button just released - end drag
                if (dragCoordinates.length > 1) {
                    events.push({
                        type: 'mousedrag',
                        timestamp: dragStartTime!,
                        data: { coordinates: dragCoordinates }
                    });
                }
                events.push({
                    type: 'mouseup',
                    timestamp: instruction.timestamp,
                    data: { x, y }
                });
                dragStartTime = null;
                dragCoordinates = [];
            } else if (currentButtonState === '1' && dragStartTime !== null) {
                // Button still held - accumulate coordinates
                dragCoordinates.push({
                    time: instruction.timestamp - dragStartTime,
                    x,
                    y
                });
            }

            lastButtonState = currentButtonState;
        }

        return events;
    }

    async process(sessionId: string): Promise<ProcessedEvent[]> {
        const content = fs.readFileSync(path.join(this.dataDir, `${sessionId}.guac`), 'utf8');
        const instructions = this.parseInstructions(content);
        
        return [
            ...this.processKeyboardEvents(instructions),
            ...this.processMouseEvents(instructions)
        ];
    }
}
