import { Anthropic } from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GenericModelMessage } from "../../types.js";

export type LLMProvider = "openai" | "anthropic";

export type StreamResponse = AsyncIterable<{
  type: "text_delta" | "tool_call" | "stop" | "error";
  delta?: string;
  function?: {
    id: string;
    name: string;
    arguments: string;
  };
  message?: string;
}>;

export interface ILLMService {
  createChatCompletion(
    messages: GenericModelMessage[],
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[] | Anthropic.Beta.BetaTool[],
    toolChoice?: OpenAI.Chat.Completions.ChatCompletionToolChoiceOption | Anthropic.Beta.BetaToolChoice
  ): Promise<StreamResponse>;
}

export interface LLMConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}
