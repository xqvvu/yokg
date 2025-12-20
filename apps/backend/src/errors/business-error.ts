import type { ErrorCodeValue } from "@graph-mind/shared/lib/error-codes";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class BusinessError extends HTTPException {
  public readonly errcode: ErrorCodeValue;

  constructor(
    status: ContentfulStatusCode,
    options: {
      errcode: ErrorCodeValue;
      message?: string;
    } & ConstructorParameters<typeof HTTPException>[1],
  ) {
    const { errcode, message, ...httpExceptionOptions } = options;
    super(status, { message, ...httpExceptionOptions });
    this.errcode = errcode;
    this.name = "BusinessError";
  }
}
