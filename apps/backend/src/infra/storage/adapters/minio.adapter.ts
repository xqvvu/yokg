import type { S3Client } from "@aws-sdk/client-s3";
import { AWSS3StorageAdapter } from "@/infra/storage/adapters/aws-s3.adapter";
import type { IObjectStorage } from "@/infra/storage/interface";

export class MinioStorageAdapter extends AWSS3StorageAdapter implements IObjectStorage {
  constructor(
    protected readonly client: S3Client,
    protected readonly bucket: string,
  ) {
    super(client, bucket);
  }
}
