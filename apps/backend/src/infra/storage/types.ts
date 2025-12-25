import type { Readable } from "node:stream";

/**
 * 对象数据类型，支持流式读取和缓冲区
 */
export type Body = Readable | Buffer | string;

/**
 * 对象元数据信息
 */
export interface ObjectMetadata {
  /** 内容类型 (MIME type) */
  contentType?: string;
  /** 内容长度 (字节) */
  contentLength?: number;
  /** ETag (对象版本标识) */
  etag?: string;
  /** 最后修改时间 */
  lastModified?: Date;
  /** 自定义元数据键值对 */
  customMetadata?: Record<string, string>;
}

// === ensureBucket ===

/**
 * ensureBucket 方法返回值
 * 确保 bucket 存在，如果不存在则创建
 */
export interface EnsureBucketResult {
  /** bucket 名字 */
  bucket: string;
  /** 是否成功创建 bucket */
  created: boolean;
  /** bucket 是否已存在 */
  existed: boolean;
}

// === uploadObject ===

/**
 * uploadObject 方法参数
 * 上传对象到指定 bucket
 */
export interface UploadObjectParams {
  /** 对象键 (路径) */
  key: string;
  /** 对象数据内容 */
  body: Body;
  /** 内容类型 (MIME type) */
  contentType?: string;
  /** 自定义元数据键值对 */
  metadata?: Record<string, string>;
}

/**
 * uploadObject 方法返回值
 */
export interface UploadObjectResult {
  /** bucket 名字 */
  bucket: string;
  /** 对象键 */
  key: string;
  /** ETag (对象版本标识) */
  etag?: string;
  /** 上传完成时间 */
  uploadTime: Date;
}

// === generatePresignedPutUrl ===

/**
 * generatePresignedPutUrl 方法参数
 * 生成用于上传对象的预签名 URL (PUT)
 */
export interface GeneratePresignedPutUrlParams {
  /** 对象键 */
  key: string;
  /** URL 过期时间 (秒) */
  expiresIn?: number;
  /** 内容类型 */
  contentType?: string;
  /** 自定义元数据 */
  metadata?: Record<string, string>;
}

/**
 * generatePresignedPutUrl 方法返回值
 */
export interface GeneratePresignedPutUrlResult {
  /** bucket 名字 */
  bucket: string;
  /** 对象键 */
  key: string;
  /** 预签名上传 URL */
  url: string;
  /** URL 过期时间戳 */
  expiresAt: Date;
}

// === generatePresignedGetUrl ===

/**
 * generatePresignedGetUrl 方法参数
 * 生成用于下载对象的预签名 URL (GET)
 */
export interface GeneratePresignedGetUrlParams {
  /** 对象键 */
  key: string;
  /** URL 过期时间 (秒) */
  expiresIn?: number;
}

/**
 * generatePresignedGetUrl 方法返回值
 */
export interface GeneratePresignedGetUrlResult {
  /** bucket 名字 */
  bucket: string;
  /** 对象键 */
  key: string;
  /** 预签名下载 URL */
  url: string;
  /** URL 过期时间戳 */
  expiresAt: Date;
}

// === generatePublicGetUrl ===

/**
 * generatePublicGetUrl 方法参数
 * 生成公共可访问的下载 URL
 */
export interface GeneratePublicGetUrlParams {
  /** 对象键 */
  key: string;
}

/**
 * generatePublicGetUrl 方法返回值
 */
export interface GeneratePublicGetUrlResult {
  /** bucket 名字 */
  bucket: string;
  /** 对象键 */
  key: string;
  /** 公共下载 URL */
  url: string;
}

// === downloadObject ===

/**
 * downloadObject 方法参数
 * 下载指定对象的数据和元数据
 */
export interface DownloadObjectParams {
  /** 对象键 */
  key: string;
}

/**
 * downloadObject 方法返回值
 */
export interface DownloadObjectResult {
  /** bucket 名字 */
  bucket: string;
  /** 对象键 */
  key: string;
  /** 对象数据内容 */
  body: Body;
  /** 对象元数据信息 */
  metadata: ObjectMetadata;
}

// === deleteObject ===

/**
 * deleteObject 方法参数
 * 删除指定对象
 */
export interface DeleteObjectParams {
  /** 对象键 */
  key: string;
}

/**
 * deleteObject 方法返回值
 */
export interface DeleteObjectResult {
  /** bucket 名字 */
  bucket: string;
  /** 对象键 */
  key: string;
  /** 是否成功删除 */
  deleted: boolean;
}

// === deleteObjectByMultiKeys ===

/**
 * deleteObjectByMultiKeys 方法参数
 * 批量删除多个对象
 */
export interface DeleteObjectByMultiKeysParams {
  /** 要删除的对象键列表 */
  keys: string[];
}

/**
 * deleteObjectByMultiKeys 方法返回值
 */
export interface DeleteObjectByMultiKeysResult {
  /** bucket 名字 */
  bucket: string;
  /** 成功删除的对象键列表 */
  deleted: string[];
  /** 删除失败的对象列表 */
  failed: Array<{
    /** 对象键 */
    key: string;
    /** 错误信息 */
    error: string;
  }>;
  /** 总删除数量 */
  total: number;
}

// === deleteObjectByPrefix ===

/**
 * deleteObjectByPrefix 方法参数
 * 按前缀删除对象
 */
export interface DeleteObjectByPrefixParams {
  /** 对象键前缀 */
  prefix: string;
}

/**
 * deleteObjectByPrefix 方法返回值
 */
export interface DeleteObjectByPrefixResult {
  /** bucket 名字 */
  bucket: string;
  /** 删除的前缀 */
  prefix: string;
  /** 删除的对象数量 */
  deletedCount: number;
}

// === listObjects ===

/**
 * listObjects 方法参数
 * 列出 bucket 中的对象
 */
export interface ListObjectsParams {
  /** 对象键前缀过滤 */
  prefix?: string;
  /** 分隔符，用于分组 */
  delimiter?: string;
}

/**
 * listObjects 方法返回值
 */
export interface ListObjectsResult {
  /** bucket 名字 */
  bucket: string;
  /** 对象键列表 */
  keys: string[];
  /** 查询使用的前缀 */
  prefix: string;
}

// === getObjectMetaData ===

/**
 * getObjectMetaData 方法参数
 * 获取对象的元数据信息
 */
export interface GetObjectMetaDataParams {
  /** 对象键 */
  key: string;
}

/**
 * getObjectMetaData 方法返回值
 */
export interface GetObjectMetaDataResult {
  /** bucket 名字 */
  bucket: string;
  /** 对象键 */
  key: string;
  /** 对象元数据信息 */
  metadata: ObjectMetadata;
}

// === checkObjectIfExists ===

/**
 * checkObjectIfExists 方法参数
 * 检查多个对象是否存在
 */
export interface CheckObjectIfExistsParams {
  /** 要检查的对象键列表 */
  keys: string[];
}

/**
 * checkObjectIfExists 方法返回值
 */
export interface CheckObjectIfExistsResult {
  /** bucket 名字 */
  bucket: string;
  /** 对象是否存在 */
  exists: boolean;
}
