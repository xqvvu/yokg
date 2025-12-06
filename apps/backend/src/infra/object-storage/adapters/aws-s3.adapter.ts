import type { S3Client } from "@aws-sdk/client-s3";
import {
  BucketAlreadyExists,
  BucketAlreadyOwnedByYou,
  CreateBucketCommand,
  PutObjectCommand,
  waitUntilBucketExists,
} from "@aws-sdk/client-s3";
import { getLogger, infra } from "@/infra/logger";
import type { IObjectStorageRepository } from "@/infra/object-storage/interface";
import type {
  Bucket,
  EnsureBucketParams,
  UploadObjectParams,
} from "@/infra/object-storage/types";
import { getConfig } from "@/lib/config";

export class AWSS3StorageAdapter implements IObjectStorageRepository {
  constructor(protected readonly client: S3Client) {}

  protected bucketMap = new Map<Bucket, string>([
    ["public", getConfig().objectStoragePublicBucketName],
    ["private", getConfig().objectStoragePrivateBucketName],
  ]);

  async ensureBucket(params: EnsureBucketParams): Promise<void> {
    const logger = getLogger(infra.objectStorage);
    const Bucket = this.bucketMap.get(params.bucket);

    const command = new CreateBucketCommand({ Bucket });

    try {
      const { Location } = await this.client.send(command);
      await waitUntilBucketExists(
        { client: this.client, maxWaitTime: 30_000 },
        { Bucket },
      );
      logger.info`Bucket ${Bucket} created at ${Location}`;
    } catch (error) {
      if (error instanceof BucketAlreadyExists) {
        logger.warn`Bucket ${Bucket} already exists`;
      } else if (error instanceof BucketAlreadyOwnedByYou) {
        logger.warn`Bucket ${Bucket} already exists in this object storage account`;
      } else {
        throw error;
      }
    }
  }

  async uploadObject(params: UploadObjectParams): Promise<void> {
    const { contentType, key, body, bucket } = params;

    const Bucket = this.bucketMap.get(bucket);

    const command = new PutObjectCommand({
      Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.client.send(command);
  }

  downloadObject(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  deleteObject(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  destroy(): void {
    this.client.destroy();
  }
}
