import { isNil } from "es-toolkit";

export class LLMService {
  async chatCompletions() {}

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
