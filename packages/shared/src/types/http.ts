export type ErrorResult = {
  errcode: number;
  errmsg: string;
  ok: false;
};

export type SuccessResult<T = unknown> = {
  message: string;
  code: number;
  ok: true;
  data?: T;
};

export type Result<T = unknown> = ErrorResult | SuccessResult<T>;

export type BetterAuthResult<T = unknown> = {
  data: Result<T>;
  error: unknown;
};

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
