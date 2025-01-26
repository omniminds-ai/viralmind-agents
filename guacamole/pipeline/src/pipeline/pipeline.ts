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
        return allEvents;
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
