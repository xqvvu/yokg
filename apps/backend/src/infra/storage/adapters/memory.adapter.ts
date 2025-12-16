import type { IObjectStorage } from "@/infra/storage/interface";
import type {
  EnsureBucketResult,
  GeneratePresignedPutUrlParams,
  GeneratePresignedPutUrlResult,
  UploadObjectParams,
} from "@/infra/storage/types";

// TODO: implement memory adapter
export class MemoryStorageAdapter implements IObjectStorage {
  ensureBucket(): Promise<EnsureBucketResult> {
    throw new Error("Method not implemented.");
  }

  uploadObject(params: UploadObjectParams): Promise<void> {
    throw new Error("Method not implemented.");
  }

  generatePresignedPutUrl(
    params: GeneratePresignedPutUrlParams,
  ): Promise<GeneratePresignedPutUrlResult> {
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
