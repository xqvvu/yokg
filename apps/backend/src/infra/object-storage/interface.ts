import type {
  EnsureBucketParams,
  UploadObjectParams,
} from "@/infra/object-storage/types";

// TODO: complete object storage repository interface
export interface IObjectStorageRepository {
  ensureBucket(params: EnsureBucketParams): Promise<void>;

  uploadObject(params: UploadObjectParams): Promise<void>;

  downloadObject(): Promise<void>;

  deleteObject(): Promise<void>;

  destroy(): void;
}
