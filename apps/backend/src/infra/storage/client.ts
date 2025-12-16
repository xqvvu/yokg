import { S3Client } from "@aws-sdk/client-s3";
import { isNil, isNotNil } from "es-toolkit";
import { getLogger, infra } from "@/infra/logger";
import { AWSS3StorageAdapter } from "@/infra/storage/adapters/aws-s3.adapter";
import { MemoryStorageAdapter } from "@/infra/storage/adapters/memory.adapter";
import { MinioStorageAdapter } from "@/infra/storage/adapters/minio.adapter";
import { RustFsStorageAdapter } from "@/infra/storage/adapters/rustfs.adapter";
import type { IObjectStorage } from "@/infra/storage/interface";
import { getConfig } from "@/lib/config";

let publicStorageClient: IObjectStorage | null = null;
let privateStorageClient: IObjectStorage | null = null;

export async function configure() {
  if (isNil(privateStorageClient)) {
    const storageLogger = getLogger(infra.storage);
    const config = getConfig();

    const publicStorageBucketName = config.objectStoragePublicBucketName;
    const privateStorageBucketName = config.objectStoragePrivateBucketName;

    switch (config.objectStorageVendor) {
      case "aws-s3": {
        const client = new S3Client({
          region: config.objectStorageRegion,
          forcePathStyle: config.objectStorageForcePathStyle,
          credentials: {
            accessKeyId: config.objectStorageAccessKey,
            secretAccessKey: config.objectStorageSecretKey,
          },
          endpoint: config.objectStorageEndpoint,
        });

        privateStorageClient = new AWSS3StorageAdapter(client, privateStorageBucketName);
        publicStorageClient = new AWSS3StorageAdapter(client, publicStorageBucketName);

        break;
      }

      case "rustfs": {
        const client = new S3Client({
          region: config.objectStorageRegion,
          forcePathStyle: true,
          credentials: {
            accessKeyId: config.objectStorageAccessKey,
            secretAccessKey: config.objectStorageSecretKey,
          },
          endpoint: config.objectStorageEndpoint,
        });

        privateStorageClient = new RustFsStorageAdapter(client, privateStorageBucketName);
        publicStorageClient = new RustFsStorageAdapter(client, publicStorageBucketName);

        break;
      }

      case "minio": {
        const client = new S3Client({
          region: config.objectStorageRegion,
          forcePathStyle: true,
          credentials: {
            accessKeyId: config.objectStorageAccessKey,
            secretAccessKey: config.objectStorageSecretKey,
          },
          endpoint: config.objectStorageEndpoint,
        });

        privateStorageClient = new MinioStorageAdapter(client, privateStorageBucketName);
        publicStorageClient = new MinioStorageAdapter(client, publicStorageBucketName);

        break;
      }

      // TODO: implement r2 adapter
      case "r2":
        throw new Error("R2 adapter not implemented");

      // TODO: implement oss adapter
      case "oss":
        throw new Error("OSS adapter not implemented");

      // TODO: implement cos adapter
      case "cos":
        throw new Error("COS adapter not implemented");

      case "memory": {
        privateStorageClient = new MemoryStorageAdapter();
        publicStorageClient = new MemoryStorageAdapter();

        break;
      }
    }

    const [privateStorage, publicStorage] = await Promise.all([
      privateStorageClient.ensureBucket(),
      publicStorageClient.ensureBucket(),
    ]);

    storageLogger.info(`Ensured storage bucket ${privateStorage.bucket} exists`);
    storageLogger.info(`Ensured storage bucket ${publicStorage.bucket} exists`);
  }
}

export function getPublicStorage() {
  if (isNil(publicStorageClient)) {
    throw new Error("Storage client has not been initialized");
  }
  return publicStorageClient;
}

export function getPrivateStorage() {
  if (isNil(privateStorageClient)) {
    throw new Error("Storage client has not been initialized");
  }
  return privateStorageClient;
}

export async function destroyStorage() {
  if (isNotNil(privateStorageClient)) {
    privateStorageClient.destroy();
    privateStorageClient = null;
  }

  if (isNotNil(publicStorageClient)) {
    publicStorageClient.destroy();
    publicStorageClient = null;
  }
}
