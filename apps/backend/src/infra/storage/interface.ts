export interface IStorage {
  ensureBucket(): Promise<void>;

  uploadObject(): Promise<void>;

  generatePresignedPutUrl(): Promise<void>;

  downloadObject(): Promise<void>;

  deleteObject(): Promise<void>;

  destroy(): void;
}
