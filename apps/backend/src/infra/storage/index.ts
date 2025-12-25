export { AwsS3Adapter } from "@/infra/storage/adapters/aws-s3.adapter";
export { MemoryAdapter } from "@/infra/storage/adapters/memory.adapter";
export { MinioAdapter } from "@/infra/storage/adapters/minio.adapter";
export { RustFsAdapter } from "@/infra/storage/adapters/rustfs.adapter";
export {
  configure,
  destroyStorage,
  getBucketNames,
  getEndpoints,
  getStorage,
} from "@/infra/storage/client";
export { getStorageLogger } from "@/infra/storage/helpers";
export type { IStorage } from "@/infra/storage/interface";
export { StorageClient } from "@/infra/storage/storage-client";
