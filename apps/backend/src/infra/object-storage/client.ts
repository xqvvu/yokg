import { S3Client } from "@aws-sdk/client-s3";
import { isNil, isNotNil } from "es-toolkit";
import { getLogger, infra } from "@/infra/logger";
import { AWSS3StorageAdapter } from "@/infra/object-storage/adapters/aws-s3.adapter";
import { MemoryStorageAdapter } from "@/infra/object-storage/adapters/memory.adapter";
import { MinioStorageAdapter } from "@/infra/object-storage/adapters/minio.adapter";
import { RustFsStorageAdapter } from "@/infra/object-storage/adapters/rustfs.adapter";
import type { IObjectStorageRepository } from "@/infra/object-storage/interface";
import { getConfig } from "@/lib/config";

let objectStorageClient: IObjectStorageRepository | null = null;

export async function configure() {
  if (isNil(objectStorageClient)) {
    const logger = getLogger(infra.objectStorage);
    const config = getConfig();

    switch (config.objectStorageVendor) {
      case "aws-s3": {
        objectStorageClient = new AWSS3StorageAdapter(
          new S3Client({
            region: config.objectStorageRegion,
            forcePathStyle: config.objectStorageForcePathStyle,
            credentials: {
              accessKeyId: config.objectStorageAccessKey,
              secretAccessKey: config.objectStorageSecretKey,
            },
            logger: logger,
            endpoint: config.objectStorageEndpoint,
          }),
        );
        break;
      }

      case "rustfs": {
        objectStorageClient = new RustFsStorageAdapter(
          new S3Client({
            region: config.objectStorageRegion,
            forcePathStyle: config.objectStorageForcePathStyle,
            credentials: {
              accessKeyId: config.objectStorageAccessKey,
              secretAccessKey: config.objectStorageSecretKey,
            },
            logger: logger,
            endpoint: config.objectStorageEndpoint,
          }),
        );
        break;
      }

      case "minio": {
        objectStorageClient = new MinioStorageAdapter(
          new S3Client({
            region: config.objectStorageRegion,
            forcePathStyle: config.objectStorageForcePathStyle,
            credentials: {
              accessKeyId: config.objectStorageAccessKey,
              secretAccessKey: config.objectStorageSecretKey,
            },
            logger: logger,
            endpoint: config.objectStorageEndpoint,
          }),
        );
        break;
      }

      // TODO: implement r2 adapter
      case "r2":
        throw new Error("R2 adapter not implemented");

      // TODO: implement oss adapter
      case "oss":
        throw new Error("OSS adapter not implemented");

      case "memory": {
        objectStorageClient = new MemoryStorageAdapter();
        break;
      }
    }

    logger.info`Object storage client connected`;
  }
}

export function getObjectStorage() {
  if (isNil(objectStorageClient)) {
    throw new Error("Object storage client not initialized");
  }
  return objectStorageClient;
}

export async function destroyObjectStorage() {
  if (isNotNil(objectStorageClient)) {
    objectStorageClient.destroy();
    objectStorageClient = null;
  }
}
