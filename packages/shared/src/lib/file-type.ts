import { isNil } from "es-toolkit";
import type { AnyWebReadableStream, FileTypeResult } from "file-type";
import {
  fileTypeFromBlob,
  fileTypeFromBuffer,
  fileTypeFromFile,
  fileTypeFromStream,
} from "file-type";

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
      from: "blob";
      file: Blob | File;
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

    case "blob": {
      result = await fileTypeFromBlob(params.file);
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
