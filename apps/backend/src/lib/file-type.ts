import path from "node:path";
import {
  BINARY_MIME_WHITELIST,
  TEXT_CUSTOM_EXTENSION_WHITE_LIST,
  TEXT_MIME_WHITELIST,
} from "@yokg/shared/lib/white-list";
import { isNil, trimStart } from "es-toolkit";
import type { AnyWebReadableStream, FileTypeResult } from "file-type";
import { fileTypeFromBuffer, fileTypeFromFile, fileTypeFromStream } from "file-type";
import mime from "mime-types";

type FileType = {
  ext: string;
  mime: string;
};

type DetectFileTypeParams =
  | {
      from: "buffer";
      file: Uint8Array | ArrayBuffer;
    }
  | {
      from: "stream";
      file: AnyWebReadableStream<Uint8Array>;
    }
  | {
      from: "path";
      file: string;
    };

export async function detectFileType(params: DetectFileTypeParams): Promise<FileType> {
  let result: FileTypeResult | undefined;

  switch (params.from) {
    case "buffer": {
      result = await fileTypeFromBuffer(params.file);
      break;
    }

    case "stream": {
      result = await fileTypeFromStream(params.file);
      break;
    }

    case "path": {
      result = await fileTypeFromFile(params.file);
      break;
    }
  }

  if (isNil(result)) {
    result = {
      ext: "bin",
      mime: "application/octet-stream",
    };
  }

  return result;
}

export function isAllowedMime(mimeType: string): boolean {
  return BINARY_MIME_WHITELIST.has(mimeType) || TEXT_MIME_WHITELIST.has(mimeType);
}

function resolveMimeFromFilename(filename: string): { mime: string; ext: string } {
  const mimeType = mime.lookup(filename);

  if (mimeType === false) {
    return { mime: "application/octet-stream", ext: "bin" };
  }

  if (mimeType === "video/mp2t") {
    return { mime: "text/plain", ext: "ts" };
  }

  const extension = mime.extension(mimeType);
  return {
    mime: mimeType,
    ext: extension || "bin",
  };
}

function normalizeToTextIfAllowed(mimeType: string): string {
  return TEXT_MIME_WHITELIST.has(mimeType) ? "text/plain" : mimeType;
}

function resolveFromCustomExtension(
  filename: string,
): { ok: true; ext: string; mime: string } | null {
  const extension = trimStart(path.extname(filename), ".");

  if (TEXT_CUSTOM_EXTENSION_WHITE_LIST.has(extension)) {
    return {
      ok: true,
      ext: extension,
      mime: "text/plain",
    };
  }

  return null;
}

export async function isValidFile(
  params: { filename: string } & DetectFileTypeParams,
): Promise<{ ok: false } | { ok: true; ext: string; mime: string }> {
  const { filename, ...detectFileTypeParams } = params;

  const fileType = await detectFileType(detectFileTypeParams);

  if (fileType.mime === "application/octet-stream" && fileType.ext === "bin") {
    const resolvedType = resolveMimeFromFilename(filename);
    const normalizedMime = normalizeToTextIfAllowed(resolvedType.mime);

    if (isAllowedMime(normalizedMime)) {
      return {
        ok: true,
        mime: normalizedMime,
        ext: resolvedType.ext,
      };
    }
  }

  const normalizedMime = normalizeToTextIfAllowed(fileType.mime);
  if (isAllowedMime(normalizedMime)) {
    return {
      ok: true,
      mime: normalizedMime,
      ext: fileType.ext,
    };
  }

  const customResolution = resolveFromCustomExtension(filename);
  return customResolution ?? { ok: false };
}
