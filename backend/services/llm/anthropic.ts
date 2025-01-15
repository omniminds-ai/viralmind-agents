import { Anthropic } from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { GenericModelMessage } from "../../types.js";

dotenv.config();

class AnthropicService {
  anthropic: Anthropic;
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  static prettyPrintJson(obj: object, maxLength = 100, indent = 2) {
    // Helper function to process values recursively
    function processValue(value: any): any {
      if (typeof value === "string" && value.length > maxLength) {
        return `[String truncated - ${value.length} chars]`;
      }

      if (Array.isArray(value)) {
        return value.map((item) => processValue(item));
      }

      if (typeof value === "object" && value !== null) {
        const processed: { [key: string]: any } = {};
        for (const [key, val] of Object.entries(value)) {
          processed[key] = processValue(val);
        }
        return processed;
      }

      return value;
    }

    // Process the object and stringify with indentation
    const processed = processValue(obj);
    return JSON.stringify(processed, null, indent);
  }
  async createChatCompletion(
    messages: GenericModelMessage[],
    _tool?: Anthropic.Beta.BetaTool,
    _toolChoice?: Anthropic.Beta.BetaToolChoice
  ): Promise<{
    [Symbol.asyncIterator](): AsyncGenerator<
      | {
          type: "tool_call";
          function: {
            id: string;
            name: string;
            arguments: string;
          };
        }
      | {
          type: "text_delta";
          delta: string;
        }
      | {
          type: "stop";
        }
      | {
          type: "error";
          message: string;
        },
      void,
      unknown
    >;
  }> {
    try {
      // TODO: figure out a better way of passing the system message than manipulating types for anthropic messages
      const systemMessage = messages.find((m) => m.role === "system")?.content;
      if (systemMessage) messages = messages.slice(1);

      // Prepare API call parameters
      const apiParams: Anthropic.Beta.Messages.MessageCreateParams = {
        model: "claude-3-5-sonnet-20241022",
        messages: messages as unknown as Anthropic.Beta.BetaMessage[],
        system: systemMessage,
        max_tokens: 1024,
        temperature: 0.9,
        stream: true,
        betas: ["computer-use-2024-10-22"],
        tools: [
          {
            type: "computer_20241022",
            name: "computer",
            display_width_px: 1280, // Match our VNC resolution
            display_height_px: 720, // Match our VNC resolution
            display_number: 1,
          },
        ],
      };

      const stream = await this.anthropic.beta.messages.create(apiParams);
      if (!stream) throw new Error("Failed to create message stream");

      // Track if we've received any content
      let currentToolCall: {
        id: string;
        name: string;
        arguments: string;
      } | null;
      return {
        async *[Symbol.asyncIterator]() {
          try {
            for await (const chunk of stream) {
              if (!chunk || typeof chunk !== "object") {
                console.warn("Received invalid chunk:", chunk);
                continue;
              }

              console.log(chunk);

              // TODO: this will never evaluate... is it needed?
              // if (chunk.type === "tool_call") {
              //   yield chunk;
              // }
              if (
                chunk.type === "content_block_start" &&
                chunk.content_block?.type === "tool_use" &&
                chunk.content_block?.id &&
                chunk.content_block?.name
              ) {
                // tool call start
                currentToolCall = {
                  id: chunk.content_block.id,
                  name: chunk.content_block.name,
                  arguments: "",
                };
              } else if (
                chunk.type === "content_block_delta" &&
                chunk.delta?.type === "input_json_delta" &&
                currentToolCall &&
                chunk.delta?.partial_json
              ) {
                // tool call delta
                const jsonDelta = chunk.delta.partial_json || "";
                currentToolCall.arguments += jsonDelta;
              } else if (
                chunk.type === "content_block_stop" &&
                currentToolCall &&
                currentToolCall.arguments
              ) {
                // tool call complete
                try {
                  if (currentToolCall.arguments)
                    JSON.parse(currentToolCall.arguments); // validate json

                  yield {
                    type: "tool_call",
                    function: {
                      id: currentToolCall.id,
                      name: currentToolCall.name,
                      arguments: currentToolCall.arguments,
                    },
                  };
                } catch (e) {
                  yield {
                    type: "error",
                    message: "Invalid tool call",
                  };
                }
                currentToolCall = null;
              } else {
                // TODO: this will always be ""
                //@ts-ignore
                const content = chunk.delta?.text || "";
                if (content)
                  yield {
                    type: "text_delta",
                    delta: content,
                  };
              }

              // if the generation is complete
              const finishReason = (
                chunk as Anthropic.Beta.Messages.BetaRawMessageDeltaEvent
              ).delta?.stop_reason;
              if (finishReason && finishReason != "tool_use")
                yield {
                  type: "stop",
                };
            }
          } catch (error) {
            console.error("Error in Claude stream:", error);
            yield {
              type: "error",
              message: "LLM Stream Error",
            };
          }
        },
      };
    } catch (error) {
      console.error("Service error:", error);
      throw error;
    }
  }
}

export default new AnthropicService();
