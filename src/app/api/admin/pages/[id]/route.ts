import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const updated = await db
    .update(pages)
    .set({
      title: body.title,
      content: body.content,
      published: body.published,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id))
    .returning();

  return NextResponse.json(updated[0]);
}
