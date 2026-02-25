import { put, del } from '@vercel/blob';
import type { StorageAdapter } from './index';

export class VercelBlobAdapter implements StorageAdapter {
  async upload(file: File, filePath: string): Promise<string> {
    const blob = await put(filePath, file, { access: 'public' });
    return blob.url;
  }

  async delete(filePath: string): Promise<void> {
    await del(filePath);
  }

  getUrl(filePath: string): string {
    return filePath;
  }
}
