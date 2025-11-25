import { z } from "zod";

export const LLMChatCompletionsSchema = z.object({
  model: z
    .string()
    .nonempty()
    .describe(
      "Corresponding Model Name. To better enhance service quality, we will make periodic changes to the models provided by this service, including but not limited to model on/offlining and adjustments to model service capabilities. We will notify you of such changes through appropriate means such as announcements or message pushes where feasible",
    ),

  messages: z.array(
    z
      .object({
        role: z.enum(["user", "system", "assistant"]),
        content: z.string().nonempty(),
      })
      .describe("A list of messages comprising the conversation so far"),
  ),

  stream: z
    .boolean()
    .default(false)
    .describe(
      "If set, tokens are returned as Server-Sent Events as they are made available. Stream terminates with data: [DONE]",
    ),

  max_tokens: z
    .int()
    .positive()
    .default(4096)
    .describe(
      "The maximum number of tokens to generate. Ensure that input tokens + max_tokens do not exceed the model's context window. As some services are still being updated, avoid setting max_tokens to the window’s upper bound; reserve ~10k tokens as buffer for input and system overhead. See Models(https://cloud.siliconflow.cn/models) for details",
    ),

  enable_thinking: z
    .boolean()
    .default(true)
    .describe(
      "Switches between thinking and non-thinking modes. Default is True",
    ),

  think_budget: z
    .int()
    .positive()
    .min(128)
    .max(32768)
    .default(4096)
    .describe(
      "Maximum number of tokens for chain-of-thought output. This field applies to all Reasoning models",
    ),

  min_p: z
    .float64()
    .positive()
    .min(0)
    .max(1)
    .default(0.05)
    .describe(
      "Dynamic filtering threshold that adapts based on token probabilities",
    ),

  stop: z
    .string()
    .nonempty()
    .or(z.null())
    .default(null)
    .describe(
      "Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence",
    ),

  temperature: z
    .float64()
    .positive()
    .min(0)
    .max(1)
    .default(0.7)
    .describe("Determines the degree of randomness in the response"),

  top_p: z
    .float64()
    .positive()
    .min(0)
    .max(1)
    .default(0.7)
    .describe(
      "The top_p (nucleus) parameter is used to dynamically adjust the number of choices for each predicted token based on the cumulative probabilities",
    ),

  top_k: z.int().positive().optional().default(50),

  frequency_penalty: z.float64().positive().min(0).max(1).default(0.5),

  n: z
    .int()
    .positive()
    .min(1)
    .default(1)
    .describe("Number of generations to return"),

  response_format: z
    .object({
      type: z.enum(["text"]),
    })
    .default({ type: "text" })
    .describe("An object specifying the format that the model must output"),

  tools: z
    .array(
      z.object({
        type: z.enum(["function"]),
        function: z.object({
          name: z
            .string()
            .nonempty()
            .max(64)
            .regex(/[a-zA-Z0-9_-]/),
          description: z.string().optional(),
          parameters: z.record(z.string(), z.any()).optional(),
          strict: z.boolean().or(z.null()).default(false),
        }),
      }),
    )
    .max(128)
    .optional()
    .describe(
      "A list of tools the model may call. Currently, only functions are supported as a tool. Use this to provide a list of functions the model may generate JSON inputs for. A max of 128 functions are supported",
    ),
});

export type LLMChatCompletionsParams = z.input<typeof LLMChatCompletionsSchema>;
