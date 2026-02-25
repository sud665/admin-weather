import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import type { StorageAdapter } from './index';

export class LocalStorageAdapter implements StorageAdapter {
  private basePath = path.join(process.cwd(), 'public', 'uploads');

  async upload(file: File, filePath: string): Promise<string> {
    const fullPath = path.join(this.basePath, filePath);
    const dir = path.dirname(fullPath);
    await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);

    return `/uploads/${filePath}`;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    await unlink(fullPath).catch(() => {});
  }

  getUrl(filePath: string): string {
    return `/uploads/${filePath}`;
  }
}
