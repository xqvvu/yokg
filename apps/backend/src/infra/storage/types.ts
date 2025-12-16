import type { PutObjectCommandInput } from "@aws-sdk/client-s3";

export type CommonResult = {
  bucket: string;
  key: string;
};

export type EnsureBucketResult = {
  exists: boolean;
  create: boolean;
  bucket: string;
};

export type UploadObjectParams = {
  key: string;
  contentType?: string;
  body: PutObjectCommandInput["Body"];
} & Omit<PutObjectCommandInput, "Body" | "Bucket" | "ContentType" | "Key">;

export type GeneratePresignedPutUrlParams = {
  key: string;
};

export type GeneratePresignedPutUrlResult = {
  url: string;
} & CommonResult;
