import { Hono } from "hono";
import { R } from "@/lib/result";

export const llm = new Hono<Env>().basePath("llm");

llm.post("/chat/completions", async function chatCompletionsHandler(c) {
  return R.ok(c);
});
