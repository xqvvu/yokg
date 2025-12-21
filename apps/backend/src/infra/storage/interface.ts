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

/**
 * 对象存储接口
 * 提供对象存储的基本 CRUD 操作和 URL 生成功能
 */
export interface IStorage {
  /**
   * 确保 bucket 存在，如果不存在则创建
   */
  ensureBucket(): Promise<EnsureBucketResult>;

  /**
   * 上传对象到指定 bucket
   */
  uploadObject(params: UploadObjectParams): Promise<UploadObjectResult>;

  /**
   * 生成用于上传对象的预签名 URL (PUT)
   */
  generatePresignedPutUrl(
    params: GeneratePresignedPutUrlParams,
  ): Promise<GeneratePresignedPutUrlResult>;

  /**
   * 生成用于下载对象的预签名 URL (GET)
   */
  generatePresignedGetUrl(
    params: GeneratePresignedGetUrlParams,
  ): Promise<GeneratePresignedGetUrlResult>;

  /**
   * 生成公共可访问的下载 URL
   */
  generatePublicGetUrl(params: GeneratePublicGetUrlParams): Promise<GeneratePublicGetUrlResult>;

  /**
   * 下载指定对象的数据和元数据
   */
  downloadObject(params: DownloadObjectParams): Promise<DownloadObjectResult>;

  /**
   * 删除指定对象
   */
  deleteObject(params: DeleteObjectParams): Promise<DeleteObjectResult>;

  /**
   * 批量删除多个对象
   */
  deleteObjectByMultiKeys(
    params: DeleteObjectByMultiKeysParams,
  ): Promise<DeleteObjectByMultiKeysResult>;

  /**
   * 按前缀删除对象
   */
  deleteObjectByPrefix(params: DeleteObjectByPrefixParams): Promise<DeleteObjectByPrefixResult>;

  /**
   * 列出 bucket 中的对象
   */
  listObjects(params?: ListObjectsParams): Promise<ListObjectsResult>;

  /**
   * 获取对象的元数据信息
   */
  getObjectMetaData(params: GetObjectMetaDataParams): Promise<GetObjectMetaDataResult>;

  /**
   * 检查多个对象是否存在
   */
  checkObjectIfExists(params: CheckObjectIfExistsParams): Promise<CheckObjectIfExistsResult>;

  /**
   * 销毁存储实例，清理资源
   */
  destroy(): void;
}
