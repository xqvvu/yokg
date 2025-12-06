import type { S3Client } from "@aws-sdk/client-s3";
import { AWSS3StorageAdapter } from "@/infra/object-storage/adapters/aws-s3.adapter";
import type { IObjectStorageRepository } from "@/infra/object-storage/interface";

export class RustFsStorageAdapter
  extends AWSS3StorageAdapter
  implements IObjectStorageRepository
{
  constructor(protected readonly client: S3Client) {
    super(client);
  }
}
