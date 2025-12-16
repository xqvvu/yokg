import type {
  EnsureBucketResult,
  GeneratePresignedPutUrlParams,
  GeneratePresignedPutUrlResult,
  UploadObjectParams,
} from "@/infra/storage/types";

// TODO: complete object storage repository interface
export interface IObjectStorage {
  ensureBucket(): Promise<EnsureBucketResult>;

  uploadObject(params: UploadObjectParams): Promise<void>;

  generatePresignedPutUrl(
    params: GeneratePresignedPutUrlParams,
  ): Promise<GeneratePresignedPutUrlResult>;

  downloadObject(): Promise<void>;

  deleteObject(): Promise<void>;

  destroy(): void;
}
