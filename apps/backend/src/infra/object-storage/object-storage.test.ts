import fs from "node:fs";
import path from "node:path";
import stream from "node:stream";
import { detectFileType } from "@graph-mind/shared/lib/file-type";
import { uuidv7 } from "@graph-mind/shared/lib/uuid";
import { beforeAll, describe, expect, it } from "vitest";
import {
  configure as configureObjectStorage,
  getObjectStorage,
} from "@/infra/object-storage/client";

beforeAll(() => {
  process.loadEnvFile(path.join(import.meta.dirname, "../../../.env"));
  configureObjectStorage();
});

describe("Object Storage", () => {
  it("should be connected", () => {
    const storage = getObjectStorage();

    expect(storage).toBeDefined();
  });

  it("should create a bucket", async () => {
    const storage = getObjectStorage();

    await Promise.all([
      storage.ensureBucket({ bucket: "public" }),
      storage.ensureBucket({ bucket: "private" }),
    ]);
  });

  it("should upload a object", async () => {
    const storage = getObjectStorage();

    const filePath = path.resolve("/Users/chuanhu9/Downloads/测试一下.docx");
    const file = fs.statSync(filePath);

    if (!file.isFile()) return;

    const fileType = await detectFileType({
      from: "stream",
      file: stream.Readable.toWeb(fs.createReadStream(filePath)),
    });

    await storage.uploadObject({
      bucket: "private",
      key: `${uuidv7()}.${fileType.ext}`,
      body: fs.createReadStream(filePath),
      contentType: fileType.mime,
    });
  });
});
