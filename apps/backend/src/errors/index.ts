import { isError } from "es-toolkit";

export { BusinessError } from "@/errors/business-error";
export { RetryableError } from "@/errors/retryable-error";
export { SystemError } from "@/errors/system-error";

export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  if (!isError(error)) return "Unknown error";

  if (error instanceof AggregateError) {
    return (
      error.errors
        .map((e) => e.message)
        .filter(Boolean)
        .join("; ") || "Unknown error"
    );
  }

  return error.message || "Unknown error";
}
