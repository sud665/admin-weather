export interface StorageAdapter {
  upload(file: File, path: string): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}

export function getStorageAdapter(): StorageAdapter {
  // 추후 STORAGE_PROVIDER 환경변수로 Cloudinary/S3 전환
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { LocalStorageAdapter } = require('./local-adapter');
  return new LocalStorageAdapter();
}
