import path from "node:path";
import { describe, expect, it } from "vitest";
import { getMimeType } from "./mime";

describe("Mime", () => {
  it("should get the mime type of a file", () => {
    const mimeType = getMimeType(path.join(process.cwd(), "apps/backend/.env"));
    expect(mimeType).toBe("text/plain");
  });
});
