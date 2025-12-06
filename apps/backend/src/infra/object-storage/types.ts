import type { PutObjectCommandInput } from "@aws-sdk/client-s3";

export type Bucket = "public" | "private";

export type EnsureBucketParams = {
  bucket: Bucket;
};

export type UploadObjectParams = {
  key: string;
  bucket: Bucket;
  contentType?: string;
  body: PutObjectCommandInput["Body"];
};
