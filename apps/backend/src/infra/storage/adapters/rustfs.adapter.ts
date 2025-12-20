import { AwsS3ExtendedAdapter } from "@/infra/storage/adapters/aws-s3.extended.adapter";
import type { IStorage } from "@/infra/storage/interface";

export class RustFsAdapter extends AwsS3ExtendedAdapter implements IStorage {}
