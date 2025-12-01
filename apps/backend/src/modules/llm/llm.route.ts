import { Hono } from "hono";
import { R } from "@/lib/http";
import { getLLMService } from "@/modules/llm/llm.service";

export const llm = new Hono<Env>().basePath("llm");

llm.post("/chat/completions", async function chatCompletionsHandler(c) {
  const llmService = getLLMService();
  const text = await llmService.chatCompletionsStreamObject();
  return R.ok(c, text);
});
