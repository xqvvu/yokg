import { createAnthropic } from "@ai-sdk/anthropic";
import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { generateText, streamText } from "ai";
import { isError, isNil } from "es-toolkit";
import { BusinessException } from "@/exceptions/business-exception";

const anthropic = createAnthropic({
  apiKey: "15iUBsaM3Pq6qc4BWVQnmicxMHVSuIIeuUykfyDJ5H6iwnAA",
  baseURL: "https://obegeiepkdvx.sealoshzh.site/v1",
});

export class LLMService {
  async chatCompletionsText() {
    try {
      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-5-20250929"),
        prompt: "Hi, who are you? And who made you? And what model is yours?",
      });

      return text;
    } catch (error) {
      console.error(error);
      const message = isError(error) ? error.message : "Unknown error";
      throw new BusinessException(500, {
        errcode: ErrorCode.INTERNAL_ERROR,
        message,
      });
    }
  }

  async chatCompletionsStreamObject() {
    try {
      const stream = streamText({
        model: anthropic("claude-sonnet-4-5-20250929"),
        prompt: "Hi, who are you? And who made you? And what model is yours?",
      });

      const result = [];
      for await (const chunk of stream.fullStream) {
        result.push(chunk);
      }

      return result;
    } catch (error) {
      console.error(error);
      const message = isError(error) ? error.message : "Unknown error";
      throw new BusinessException(500, {
        errcode: ErrorCode.INTERNAL_ERROR,
        message,
      });
    }
  }

  async embeddings() {}

  async rerank() {}
}

let llmService: LLMService | null = null;
export function getLLMService() {
  if (isNil(llmService)) {
    llmService = new LLMService();
  }
  return llmService;
}
