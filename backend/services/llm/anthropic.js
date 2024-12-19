import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from "dotenv";

dotenv.config();

class AnthropicService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async createChatCompletion(messages, tools, tool_choice) {
    try {
      if (!messages || !Array.isArray(messages)) {
        throw new Error('Messages must be a non-empty array');
      }

      // Convert OpenAI format messages to Anthropic format
      const anthropicMessages = messages.map(msg => {
        if (!msg || typeof msg !== 'object') {
          throw new Error('Invalid message format');
        }

        // Handle messages with image content
        if (Array.isArray(msg.content)) {
          return {
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content.map(content => {
              if (!content || typeof content !== 'object') {
                throw new Error('Invalid content format');
              }

              if (content.type === 'text') {
                return { type: 'text', text: content.text };
              } else if (content.type === 'image_url') {
                return {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: content.image_url.url.split(',')[1] // Remove data URI prefix
                  }
                };
              }
              return content;
            })
          };
        }
        
        // Handle text-only messages
        return {
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        };
      });

      // Track if we've received any content
      let hasReceivedContent = false;
      let currentToolCall = null;

      // Prepare API call parameters
      const apiParams = {
        model: 'claude-3-5-sonnet-20241022',
        messages: anthropicMessages,
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
          }
        ]
      };

      // Add system message if present
      const systemMessage = messages.find(m => m.role === 'system')?.content;
      if (systemMessage) {
        apiParams.system = systemMessage;
      }

      // console.log('Creating Anthropic stream with params:', apiParams);

      const stream = await this.anthropic.beta.messages.create(apiParams);

      if (!stream) {
        throw new Error('Failed to create message stream');
      }

      // Convert Anthropic stream to OpenAI-like format
      return {
        async *[Symbol.asyncIterator]() {
          try {
            for await (const chunk of stream) {
              if (!chunk || typeof chunk !== 'object') {
                console.warn('Received invalid chunk:', chunk);
                continue;
              }

              // console.log('Processing chunk type:', chunk.type);
              // console.log(chunk);

              if (chunk.type === 'content_block_start' && chunk.content_block?.type === 'tool_use') {
                currentToolCall = {
                  id: chunk.content_block.id,
                  name: chunk.content_block.name,
                  arguments: ''
                };
              } else if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'input_json_delta') {
                if (currentToolCall) {
                  currentToolCall.arguments += chunk.delta.partial_json || '';
                }
              } else if (chunk.type === 'content_block_stop' && currentToolCall) {
                // When tool call is complete, yield it with accumulated content
                try {
                  JSON.parse(currentToolCall.arguments); // Validate JSON
                  yield {
                    choices: [{
                      delta: {
                        // content: accumulatedContent,
                        tool_calls: [{
                          index: 0,
                          id: currentToolCall.id,
                          type: 'function',
                          function: {
                            name: currentToolCall.name,
                            arguments: currentToolCall.arguments
                          }
                        }]
                      }
                    }]
                  };
                  hasReceivedContent = true;
                } catch (e) {
                  console.error('Invalid tool call JSON:', e);
                }
                currentToolCall = null;
              } else {
                const content = chunk.delta?.text || '';
                const finishReason = chunk.delta?.stop_reason;
                
                // Track content
                if (content) {
                  hasReceivedContent = true;
                }

                // Only yield chunks that have content or a finish reason
                if (content || finishReason) {
                  yield {
                    choices: [{
                      delta: {
                        content: content,
                      },
                      finish_reason: finishReason
                    }]
                  };
                }
              } 
            }

            // If we haven't received any content, yield default message
            if (!hasReceivedContent) {
              console.warn('No content received from Claude');
              yield {
                choices: [{
                  delta: {
                    content: 'I apologize, but I was unable to generate a response. Please try again.',
                  },
                  finish_reason: 'stop'
                }]
              };
            }
          } catch (error) {
            console.error('Error in Claude stream:', error);
            yield {
              choices: [{
                delta: {
                  content: 'An error occurred while processing your request. Please try again.',
                },
                finish_reason: 'error'
              }]
            };
          }
        }
      };

    } catch (error) {
      console.error("Anthropic Service Error:", error);
      throw error;
    }
  }
}

export default new AnthropicService();
