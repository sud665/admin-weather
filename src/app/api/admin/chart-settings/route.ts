import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { chartSettings } from '@/db/schema';

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await db.select().from(chartSettings);
  return NextResponse.json(settings);
}
