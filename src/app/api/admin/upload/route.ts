import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStorageAdapter } from '@/lib/storage';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file)
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const storage = getStorageAdapter();
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${timestamp}-${safeName}`;
  const url = await storage.upload(file, filePath);

  return NextResponse.json({ url, path: filePath });
}
