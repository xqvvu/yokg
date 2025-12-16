import type { MiddlewareHandler } from "hono";

type ValidationTargets = {
  age: {
    name: string;
  };
};

type WithAge<T> = {
  out: {
    age: T;
  };
};

export function ageMiddleware<T>(): MiddlewareHandler<Env, string, WithAge<T>> {
  return async (c, next) => {
    // c.req.addValidatedData("json", { name: 1 } as T);
    await next();
  };
}
