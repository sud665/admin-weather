import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allPages = await db.select().from(pages);
  return NextResponse.json(allPages);
}
