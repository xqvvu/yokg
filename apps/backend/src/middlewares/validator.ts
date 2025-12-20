import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { sValidator } from "@hono/standard-validator";
import { isNotNil } from "es-toolkit";
import type { ZodType } from "zod";
import { BusinessError } from "@/errors/business-error";

export function validator<T extends ZodType>(type: Parameters<typeof sValidator>[0], schema: T) {
  return sValidator(type, schema, (result) => {
    if (!result.success) {
      const issues = result.error;
      if (issues.length === 0) {
        throw new BusinessError(400, {
          errcode: ErrorCode.INVALID_REQUEST,
          message: "Bad Request",
        });
      }

      const paths = [];
      for (const issue of issues) {
        if (issue.path) {
          paths.push(...issue.path.flat());
        }
      }
      const fields = Array.from(new Set(paths)).filter(isNotNil).join(", ");
      throw new BusinessError(400, {
        errcode: ErrorCode.INVALID_REQUEST,
        message: `Invalid parameters. Please check: ${fields}`,
      });
    }
  });
}
