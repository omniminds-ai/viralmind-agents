import { Message, ProcessedEvent, PipelineStage } from "../../shared/types";

export class MessageFormatter implements PipelineStage<ProcessedEvent[], Message[]> {
    async process(events: ProcessedEvent[]): Promise<Message[]> {
        return events.map(event => ({
            role: this.determineRole(event.type),
            content: this.formatContent(event),
            timestamp: event.timestamp
        }));
    }

    private determineRole(eventType: string): "user" | "assistant" {
        switch (eventType) {
            case "hint":
            case "frame":
                return "user";
            case "mousedrag":
            case "mouseclick":
            case "type":
            case "hotkey":
                return "assistant";
            default:
                return "assistant";
        }
    }

    private formatContent(event: ProcessedEvent): string | { type: 'image'; data: string; } {
        if (event.type === "frame" && event.data.frame) {
            return {
                type: 'image',
                data: event.data.frame
            };
        }

        if (event.type === "hint") {
            return event.data.text || "";
        }

        let action = "";
        switch (event.type) {
            case "mousedrag":
                if (event.data.coordinates && event.data.coordinates.length >= 2) {
                    const points = event.data.coordinates.map(c => [c.x, c.y]).flat();
                    action = `drag([${points.join(', ')}])`;
                }
                break;
            case "mouseclick":
                action = `click(${event.data.x}, ${event.data.y})`;
                break;
            case "type":
                action = `type("${event.data.text}")`;
                break;
            case "hotkey":
                action = `hotkey("${event.data.text}")`;
                break;
            default:
                return ""; // Skip other non-actionable events
        }

        return action ? "```python\n" + action + "\n```" : "";
    }
}
