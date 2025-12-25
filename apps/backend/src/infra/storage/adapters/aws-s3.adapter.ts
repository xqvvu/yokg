import type { S3Client } from "@aws-sdk/client-s3";
import { HeadBucketCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { addSeconds } from "date-fns";
import type { IStorage } from "@/infra/storage/interface";
import type {
  CheckObjectIfExistsParams,
  CheckObjectIfExistsResult,
  DeleteObjectByMultiKeysParams,
  DeleteObjectByMultiKeysResult,
  DeleteObjectByPrefixParams,
  DeleteObjectByPrefixResult,
  DeleteObjectParams,
  DeleteObjectResult,
  DownloadObjectParams,
  DownloadObjectResult,
  EnsureBucketResult,
  GeneratePresignedGetUrlParams,
  GeneratePresignedGetUrlResult,
  GeneratePresignedPutUrlParams,
  GeneratePresignedPutUrlResult,
  GeneratePublicGetUrlParams,
  GeneratePublicGetUrlResult,
  GetObjectMetaDataParams,
  GetObjectMetaDataResult,
  ListObjectsParams,
  ListObjectsResult,
  UploadObjectParams,
  UploadObjectResult,
} from "@/infra/storage/types";

export class AwsS3Adapter implements IStorage {
  constructor(
    public readonly bucketName: string,
    protected readonly internal: S3Client,
    protected readonly external?: S3Client,
  ) {}

  async ensureBucket(): Promise<EnsureBucketResult> {
    await this.internal.send(
      new HeadBucketCommand({
        Bucket: this.bucketName,
      }),
    );

    return {
      bucket: this.bucketName,
      created: false,
      existed: true,
    };
  }

  async uploadObject(params: UploadObjectParams): Promise<UploadObjectResult> {
    const { body, key, contentType, metadata } = params;

    const upload = new Upload({
      client: this.internal,
      params: {
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        Metadata: metadata,
        Body: body,
      },
    });

    const { ETag } = await upload.done();

    return {
      bucket: this.bucketName,
      etag: ETag,
      key: key,
      uploadTime: new Date(),
    };
  }

  async generatePresignedPutUrl(
    params: GeneratePresignedPutUrlParams,
  ): Promise<GeneratePresignedPutUrlResult> {
    const { key, contentType, expiresIn = 900, metadata } = params;

    const client = this.external ?? this.internal;
    const expiresAt = addSeconds(new Date(), expiresIn);

    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        Metadata: metadata,
      }),
      { expiresIn },
    );

    return {
      bucket: this.bucketName,
      expiresAt: expiresAt,
      key: key,
      url: url,
    };
  }

  generatePresignedGetUrl(
    params: GeneratePresignedGetUrlParams,
  ): Promise<GeneratePresignedGetUrlResult> {
    throw new Error("Method not implemented.");
  }

  generatePublicGetUrl(params: GeneratePublicGetUrlParams): Promise<GeneratePublicGetUrlResult> {
    throw new Error("Method not implemented.");
  }

  downloadObject(params: DownloadObjectParams): Promise<DownloadObjectResult> {
    throw new Error("Method not implemented.");
  }

  deleteObject(params: DeleteObjectParams): Promise<DeleteObjectResult> {
    throw new Error("Method not implemented.");
  }

  deleteObjectByMultiKeys(
    params: DeleteObjectByMultiKeysParams,
  ): Promise<DeleteObjectByMultiKeysResult> {
    throw new Error("Method not implemented.");
  }

  deleteObjectByPrefix(params: DeleteObjectByPrefixParams): Promise<DeleteObjectByPrefixResult> {
    throw new Error("Method not implemented.");
  }

  listObjects(params?: ListObjectsParams): Promise<ListObjectsResult> {
    throw new Error("Method not implemented.");
  }

  getObjectMetaData(params: GetObjectMetaDataParams): Promise<GetObjectMetaDataResult> {
    throw new Error("Method not implemented.");
  }

  checkObjectIfExists(params: CheckObjectIfExistsParams): Promise<CheckObjectIfExistsResult> {
    throw new Error("Method not implemented.");
  }

  destroy(): void {
    throw new Error("Method not implemented.");
  }
}
