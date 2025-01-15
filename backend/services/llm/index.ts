import OpenAIService from "./openai.js";
import AnthropicService from "./anthropic.js";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GenericModelMessage } from "../../types.js";

class LLMService {
  getService(model: string) {
    if (!model) {
      throw new Error("Model name is required");
    }

    if (model.startsWith("gpt-")) {
      return OpenAIService;
    } else if (model.startsWith("claude-")) {
      return AnthropicService;
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
  }

  async createChatCompletion(
    model: string,
    messages: GenericModelMessage[],
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[] &
      Anthropic.Beta.BetaTool,
    tool_choice?: OpenAI.Chat.Completions.ChatCompletionToolChoiceOption &
      Anthropic.Beta.BetaToolChoice
  ) {
    const service = this.getService(model);
    return service.createChatCompletion(messages, tools, tool_choice);
  }
}

export default new LLMService();
