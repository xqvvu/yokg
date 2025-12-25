import type { ErrorCodeValue } from "@yokg/shared/lib/error-codes";
import { HTTPException } from "hono/http-exception";

export class SystemError extends HTTPException {
  public readonly errcode: ErrorCodeValue;

  constructor(
    options: {
      errcode: ErrorCodeValue;
      message?: string;
    } & ConstructorParameters<typeof HTTPException>[1],
  ) {
    const { errcode, message, ...httpExceptionOptions } = options;
    super(500, { message, ...httpExceptionOptions });
    this.errcode = errcode;
    this.name = "SystemError";
  }
}
