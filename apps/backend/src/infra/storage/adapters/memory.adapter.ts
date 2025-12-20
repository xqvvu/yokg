import type { IStorage } from "@/infra/storage/interface";

export class MemoryAdapter implements IStorage {
  ensureBucket(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  uploadObject(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  generatePresignedPutUrl(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  downloadObject(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteObject(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  destroy(): void {
    throw new Error("Method not implemented.");
  }
}
