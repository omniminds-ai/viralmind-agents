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

      // Track tool uses to validate tool results
      const toolUseIds = new Set();
      
      // First pass to collect tool use IDs
      messages.forEach(msg => {
        if (msg?.content && Array.isArray(msg.content)) {
          msg.content.forEach(content => {
            if (content.type === 'tool_use') {
              toolUseIds.add(content.tool_use_id);
            }
          });
        }
      });

      // Convert OpenAI format messages to Anthropic format and filter empty messages
      const anthropicMessages = messages.map(msg => {
        if (!msg || typeof msg !== 'object') {
          throw new Error('Invalid message format');
        }

        // Handle messages with array content
        if (Array.isArray(msg.content)) {
          // Convert and filter content items
          const convertedContent = msg.content.map(content => {
              if (!content || typeof content !== 'object') {
                throw new Error('Invalid content format');
              }

              // Convert content based on type
              switch (content.type) {
                case 'text':
                  return { type: 'text', text: content.text };
                
                case 'image_url':
                  // Convert OpenAI image_url format to Anthropic image format
                  if (content.image_url?.url) {
                    const base64Data = content.image_url.url.split(',')[1]; // Remove data URI prefix
                    return {
                      type: 'image',
                      source: {
                        type: 'base64',
                        media_type: 'image/jpeg',
                        data: base64Data
                      }
                    };
                  }
                  console.warn('Invalid image_url format:', content);
                  return null;

                case 'tool_result':
                  // Validate tool_result has corresponding tool_use
                  if (!content.tool_use_id || !toolUseIds.has(content.tool_use_id)) {
                    console.warn('Dropping tool_result without matching tool_use:', content);
                    return null;
                  }
                  
                  // Handle tool results - convert any images in content
                  if (Array.isArray(content.content)) {
                    const convertedContent = content.content.map(item => {
                      if (item.type === 'image_url') {
                        const base64Data = item.image_url.url.split(',')[1];
                        return {
                          type: 'image',
                          source: {
                            type: 'base64',
                            media_type: 'image/jpeg',
                            data: base64Data
                          }
                        };
                      }
                      return item;
                    });
                    return {
                      type: 'tool_result',
                      tool_use_id: content.tool_use_id,
                      content: convertedContent.filter(Boolean)
                    };
                  }
                  return content;

                case 'tool_use':
                  // Track tool use and pass through
                  toolUseIds.add(content.tool_use_id);
                  return content;

                default:
                  console.warn('Unknown content type:', content.type);
                  return null;
              }
            }).filter(Boolean); // Remove any null values from conversion

          // Validate converted content
          if (!convertedContent || convertedContent.length === 0) {
            console.warn('Message content array became empty after filtering invalid items');
            return null;
          }

          // Special handling for messages containing tool_use
          const hasToolUse = convertedContent.some(item => item.type === 'tool_use');
          if (hasToolUse) {
            return {
              role: 'assistant', // tool_use only comes from assistant
              content: convertedContent
            };
          }

          // Regular message handling
          return {
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: convertedContent
          };
        }
        
        // Handle text-only messages
        if (!msg.content || (typeof msg.content === 'string' && msg.content.trim() === '')) {
          console.warn('Dropping message with empty text content');
          return null;
        }
        
        return {
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        };
      })
      .filter(Boolean) // Remove null messages first
      .filter(msg => {
        // Then filter out messages with empty content
        if (!msg || !msg.content) return false;
        
        if (Array.isArray(msg.content)) {
          return msg.content.length > 0;
        }
        return typeof msg.content === 'string' && msg.content.trim() !== '';
      });

      // Ensure we have valid messages
      if (anthropicMessages.length === 0) {
        throw new Error('No valid messages after filtering empty content');
      }

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

              if (chunk.type === 'content_block_start') {
                if (chunk.content_block?.type === 'tool_use' && chunk.content_block?.id && chunk.content_block?.name) {
                  const toolUseId = chunk.content_block.id;
                  toolUseIds.add(toolUseId); // Track new tool use
                  currentToolCall = {
                    id: toolUseId,
                    name: chunk.content_block.name,
                    arguments: ''
                  };
                  // Yield tool use start
                  yield {
                    choices: [{
                      delta: {
                        tool_calls: [{
                          index: 0,
                          id: toolUseId,
                          type: 'function',
                          function: {
                            name: chunk.content_block.name,
                            arguments: ''
                          }
                        }]
                      }
                    }]
                  };
                  hasReceivedContent = true;
                }
              } else if (chunk.type === 'content_block_delta') {
                if (chunk.delta?.type === 'input_json_delta' && currentToolCall && chunk.delta?.partial_json) {
                  const jsonDelta = chunk.delta.partial_json || '';
                  currentToolCall.arguments += jsonDelta;
                  // Only yield complete valid JSON
                  // try {
                  //   JSON.parse(currentToolCall.arguments); // Test if complete valid JSON
                  //   yield {
                  //     choices: [{
                  //       delta: {
                  //         tool_calls: [{
                  //           index: 0,
                  //           id: currentToolCall.id,
                  //           type: 'function',
                  //           function: {
                  //             arguments: jsonDelta
                  //           }
                  //         }]
                  //       }
                  //     }]
                  //   };
                  // } catch (e) {
                  //   // Don't yield incomplete JSON
                  // }
                  hasReceivedContent = true;
                }
              } else if (chunk.type === 'content_block_stop' && currentToolCall && currentToolCall.arguments) {
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
