import { PipelineConfig, ProcessedEvent } from '../shared/types';
import { visualizeEvents } from '../shared/utils/visualization';

import fs from 'fs';
import path from 'path';

export class Pipeline {
    constructor(private config: PipelineConfig) {}

    async process(sessionId: string): Promise<ProcessedEvent[]> {
        let allEvents: ProcessedEvent[] = [];
        
        for (const stage of this.config.stages) {
            try {
                const stageEvents = await stage.process(sessionId);
                allEvents = [...allEvents, ...stageEvents];
            } catch (error) {
                console.error(`Pipeline stage failed:`, error);
                throw error;
            }
        }

        // Sort events by timestamp
        allEvents.sort((a, b) => a.timestamp - b.timestamp);

        // Filter consecutive frame events, keeping only the last one
        const result: ProcessedEvent[] = [];
        let consecutiveFrames: ProcessedEvent[] = [];

        for (const event of allEvents) {
            if (event.type === 'frame') {
                consecutiveFrames.push(event);
            } else {
                if (consecutiveFrames.length > 0) {
                    // Only keep the last frame from consecutive frames
                    result.push(consecutiveFrames[consecutiveFrames.length - 1]);
                    consecutiveFrames = [];
                }
                result.push(event);
            }
        }

        // Handle any remaining consecutive frames at the end
        if (consecutiveFrames.length > 0) {
            result.push(consecutiveFrames[consecutiveFrames.length - 1]);
        }

        return result;
    }

    async run(): Promise<void> {
        const results = await Promise.all(
            this.config.sessionIds.map(id => this.process(id))
        );

        // Generate debug visualizations
        results.forEach((events, i) => {
            const html = visualizeEvents(events);
            fs.writeFileSync(
                path.join(this.config.outputDir, `session_${this.config.sessionIds[i]}_debug.html`),
                html
            );
        });
    }
}
