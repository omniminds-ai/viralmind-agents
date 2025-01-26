import { describe, it, expect } from 'vitest';
import { VideoExtractor } from '../stages/extraction/video-extractor';
import { GuacExtractor } from '../stages/extraction/guac-extractor';
import { EventExtractor } from '../stages/extraction/event-extractor';
import { visualizeEvents } from '../shared/utils/visualization';
import { Pipeline } from '../pipeline/pipeline';
import fs from 'fs';
import path from 'path';

describe('Extraction Pipeline', () => {
    const TEST_SESSION_ID = '6792a2a124f444f0e39ce887';
    const DATA_DIR = path.join(__dirname, '../../data');

    it('should extract and visualize video frames', async () => {
        const extractor = new VideoExtractor(DATA_DIR);
        const events = await extractor.process(TEST_SESSION_ID);
        
        const html = visualizeEvents(events);
        fs.writeFileSync(path.join(DATA_DIR, 'video_test.html'), html);
        
        expect(events.length).toBeGreaterThan(0);
        expect(events[0].type).toBe('frame');
    });

    it('should extract and visualize guac events', async () => {
        const extractor = new GuacExtractor(DATA_DIR);
        const events = await extractor.process(TEST_SESSION_ID);
        
        const html = visualizeEvents(events);
        fs.writeFileSync(path.join(DATA_DIR, 'guac_test.html'), html);

        // Check for mouse events
        expect(events.some(e => e.type === 'mousedown')).toBe(true);
        expect(events.some(e => e.type === 'mouseup')).toBe(true);
        
        // Check for keyboard events
        expect(events.some(e => e.type === 'keydown')).toBe(true);
        expect(events.some(e => e.type === 'keyup')).toBe(true);
    });

    it('should extract and visualize session events', async () => {
        const extractor = new EventExtractor(DATA_DIR);
        const events = await extractor.process(TEST_SESSION_ID);
        
        const html = visualizeEvents(events);
        fs.writeFileSync(path.join(DATA_DIR, 'events_test.html'), html);
        
        expect(events.some(e => e.type === 'quest' || e.type === 'hint')).toBe(true);
    });
});

describe('Full Pipeline Integration', () => {
    const TEST_SESSION_ID = '6792a2a124f444f0e39ce887';
    const DATA_DIR = path.join(__dirname, '../../data');

    it('should process and merge all events', async () => {
        const pipeline = new Pipeline({
            dataDir: DATA_DIR,
            outputDir: DATA_DIR,
            sessionIds: [TEST_SESSION_ID],
            stages: [
                new VideoExtractor(DATA_DIR),
                new GuacExtractor(DATA_DIR),
                new EventExtractor(DATA_DIR)
            ]
        });

        const results = await pipeline.process(TEST_SESSION_ID);
        expect(results.length).toBeGreaterThan(0);
        
        const html = visualizeEvents(results);
        fs.writeFileSync(path.join(DATA_DIR, 'pipeline_test.html'), html);
        
        // Verify timeline consistency
        const timestamps = results.map(e => e.timestamp);
        expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
    });
});
