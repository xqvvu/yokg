import { AwsS3Adapter } from "@/infra/storage/adapters/aws-s3.adapter";
import type { IStorage } from "@/infra/storage/interface";

export class AwsS3ExtendedAdapter extends AwsS3Adapter implements IStorage {
  async ensureBucket(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async ensureBucketPublicPolicy(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
