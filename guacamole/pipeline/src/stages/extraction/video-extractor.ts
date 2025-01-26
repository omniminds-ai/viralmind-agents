import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { PipelineStage, ProcessedEvent } from '../../shared/types';

export class VideoExtractor implements PipelineStage<string, ProcessedEvent[]> {
    constructor(private dataDir: string) {}

    private async extractFrame(videoPath: string, timestamp: number): Promise<string | null> {
        const outputPath = path.join(this.dataDir, 'temp', `frame_${timestamp}.jpg`);
        
        try {
            execSync(`ffmpeg -ss ${timestamp/1000} -i "${videoPath}" -vframes 1 -y "${outputPath}"`, {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            if (!fs.existsSync(outputPath)) return null;
            
            const imageBuffer = fs.readFileSync(outputPath);
            fs.unlinkSync(outputPath);
            
            return imageBuffer.toString('base64');
        } catch {
            return null;
        }
    }

    async process(sessionId: string): Promise<ProcessedEvent[]> {
        const videoPath = path.join(this.dataDir, `${sessionId}.guac.m4v`);
        const events: ProcessedEvent[] = [];

        // Check if video file exists
        if (!fs.existsSync(videoPath)) {
            console.error(`Video file not found: ${videoPath}`);
            return events;
        }

        // Ensure temp directory exists
        const tempDir = path.join(this.dataDir, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Extract keyframes every second for demo
        // In practice, you'd want to be more selective
        for (let time = 0; time < 3 * 60000; time += 1000) {
            const frame = await this.extractFrame(videoPath, time);
            if (frame) {
                events.push({
                    type: 'frame',
                    timestamp: time,
                    data: { frame }
                });
            }
        }
        
        return events;
    }
}
