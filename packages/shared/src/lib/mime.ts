import { isNotNil } from "es-toolkit";
import mime from "mime";

export function getMimeType(path: string): string {
  const type = mime.getType(path);
  return isNotNil(type) ? type : "application/octet-stream";
}

export function getExtFromMimeType(mimeType: string): string | null {
  return mime.getExtension(mimeType);
}
