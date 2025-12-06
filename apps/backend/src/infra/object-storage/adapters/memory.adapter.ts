import type { IObjectStorageRepository } from "@/infra/object-storage/interface";
import type {
  EnsureBucketParams,
  UploadObjectParams,
} from "@/infra/object-storage/types";

// TODO: implement memory adapter
export class MemoryStorageAdapter implements IObjectStorageRepository {
  ensureBucket(params: EnsureBucketParams): Promise<void> {
    throw new Error("Method not implemented.");
  }

  uploadObject(params: UploadObjectParams): Promise<void> {
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
