import OpenAIService from './openai.js';
import AnthropicService from './anthropic.js';

class LLMService {
  getService(model) {
    if (!model) {
      throw new Error('Model name is required');
    }
    
    if (model.startsWith('gpt-')) {
      return OpenAIService;
    } else if (model.startsWith('claude-')) {
      return AnthropicService;
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  }

  async createChatCompletion(model, messages, tools, tool_choice) {
    const service = this.getService(model);
    return service.createChatCompletion(messages, tools, tool_choice);
  }
}

export default new LLMService();
