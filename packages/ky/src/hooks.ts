import type { Result } from "@graph-mind/shared/types/result";
import type { AfterResponseHook } from "ky";

export const afterResponseDestructureResult: AfterResponseHook = async (
  _request,
  _options,
  response,
  _state,
) => {
  if (
    response.status === 204 ||
    !response.headers.get("content-type")?.includes("application/json")
  ) {
    return response;
  }

  const result: Result<unknown> = await response.json(); // `.json()` will consume the response's body
  if (result.ok) {
    return new Response(JSON.stringify(result.data), {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
  }
};
