import { isError } from "es-toolkit";

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
