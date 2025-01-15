import OpenAI from "openai";
import dotenv from "dotenv";
import { GenericModelMessage } from "../../types.js";

dotenv.config();

class OpenAIService {
  public static serviceName = "openai";
  openai: OpenAI;
  model: string;
  finish_reasons: { name: string; description: string }[];
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_AI_SECRET,
    });
    this.model = "gpt-4o-mini";
    this.finish_reasons = [
      {
        name: "length",
        description: "The conversation was too long for the context window.",
      },
      {
        name: "tool_calls",
        description: "The assistant is waiting for a tool call response.",
      },
      {
        name: "content_filter",
        description:
          "The conversation was blocked by OpenAI's content filters.",
      },
      {
        name: "stop",
        description: "The conversation was ended by the user.",
      },
      {
        name: "other",
        description: "The conversation was ended for an unspecified reason.",
      },
    ];
  }

  async createChatCompletion(
    messages: GenericModelMessage[],
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[],
    tool_choice?: OpenAI.Chat.Completions.ChatCompletionToolChoiceOption
  ): Promise<
    AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk> | undefined
  > {
    try {
      const stream = await this.openai.chat.completions.create({
        model: this.model,
        messages:
          messages as unknown as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        temperature: 0.9,
        max_tokens: 1024,
        top_p: 0.7,
        frequency_penalty: 1.0,
        presence_penalty: 1.0,
        stream: true,
        tools: tools,
        tool_choice: tool_choice,
        parallel_tool_calls: false,
      });

      return stream;
    } catch (error) {
      console.error("OpenAI Service Error:", error);
    }
  }
}

export default new OpenAIService();
