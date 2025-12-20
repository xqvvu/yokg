import { isNil, isNotNil } from "es-toolkit";
import type { IStorage } from "@/infra/storage/interface";
import { getConfig } from "@/lib/config";

let publicStorageClient: IStorage | null = null;
let privateStorageClient: IStorage | null = null;

// TODO: complete storage implementation
export async function configure() {
  if (isNil(privateStorageClient)) {
    const { storage } = getConfig();

    switch (storage.vendor) {
      case "aws-s3": {
        break;
      }

      case "rustfs": {
        break;
      }

      case "minio": {
        break;
      }

      case "r2": {
        throw new Error("R2 adapter not implemented");
      }

      case "oss": {
        throw new Error("OSS adapter not implemented");
      }

      case "cos": {
        throw new Error("COS adapter not implemented");
      }

      case "memory": {
        break;
      }
    }
  }
}

export function getPublicStorage() {
  if (isNil(publicStorageClient)) {
    throw new Error("Public storage is not ready");
  }
  return publicStorageClient;
}

export function getPrivateStorage() {
  if (isNil(privateStorageClient)) {
    throw new Error("Priavte storage is not ready");
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
