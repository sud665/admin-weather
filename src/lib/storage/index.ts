export interface StorageAdapter {
  upload(file: File, path: string): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}

export function getStorageAdapter(): StorageAdapter {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  if (provider === 'vercel-blob') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { VercelBlobAdapter } = require('./vercel-blob-adapter');
    return new VercelBlobAdapter();
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { LocalStorageAdapter } = require('./local-adapter');
  return new LocalStorageAdapter();
}
