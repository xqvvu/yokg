import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import type { Result } from "@graph-mind/shared/types/http";
import { isNil, isNotNil } from "es-toolkit";
import type { Context } from "hono";
import { getErrorMessage } from "@/errors";
import { SystemError } from "@/errors/system-error";

export const R = {
  raw<T = unknown>(params: {
    ok: boolean;
    data?: T;
    errcode?: number;
    errmsg?: string;
  }): Result<T> {
    const { ok, data, errcode = -1, errmsg = "error" } = params;
    if (ok) {
      return {
        ok,
        data,
        code: 0,
        message: "success",
      };
    }

    return {
      ok,
      errcode,
      errmsg,
    };
  },

  ok<T = unknown>(c: Context<Env>, data?: T) {
    return c.json(this.raw({ ok: true, data }));
  },

  fail(c: Context<Env>, params?: { errcode?: number; errmsg?: string }) {
    const { errcode = -1, errmsg = "error" } = params ?? {};
    return c.json(this.raw({ ok: false, errcode, errmsg }));
  },
};

type CloneAndFormatJSONResponseInit =
  | {
      mode: "append";
      status?: number | undefined;
      statusText?: string | undefined;
      headers?: [string, string][] | Record<string, string> | Headers | undefined;
    }
  | {
      mode: "overwrite";
      headers: [string, string][] | Record<string, string> | Headers;
      status?: number | undefined;
      statusText?: string | undefined;
    }
  | {
      status?: number | undefined;
      statusText?: string | undefined;
      mode?: undefined;
    };

export async function cloneAndFormatJSONResponse(
  response: Response,
  init?: CloneAndFormatJSONResponseInit,
): Promise<Response> {
  try {
    const clonedResponse = response.clone();

    let headers: Headers;
    if (init?.mode === "append") {
      headers = appendHeaders(response.headers, init.headers);
    } else if (init?.mode === "overwrite") {
      headers = new Headers(init.headers);
    } else {
      headers = new Headers(response.headers);
    }

    const data = await clonedResponse.json();
    return new Response(isNil(data) ? null : JSON.stringify(R.raw({ ok: true, data })), {
      headers,
      status: isNil(init?.status) ? response.status : init.status,
      statusText: isNil(init?.statusText) ? response.statusText : init.statusText,
    });
  } catch (error) {
    throw new SystemError({
      errcode: ErrorCode.INTERNAL_ERROR,
      message: `Clone JSON response failed: ${getErrorMessage(error)}`,
    });
  }
}

export function appendHeaders(headers: Headers, appendHeaders?: HeadersInit) {
  const h = new Headers(headers);
  if (isNotNil(appendHeaders)) {
    const ah = new Headers(appendHeaders);
    ah.forEach((v, k) => void h.append(k, v));
  }
  return h;
}
