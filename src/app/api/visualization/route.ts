import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { visualizationResults } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const combinationKey = searchParams.get('combination') || 'default';

  const results = await db
    .select()
    .from(visualizationResults)
    .where(eq(visualizationResults.combinationKey, combinationKey))
    .orderBy(asc(visualizationResults.year));

  return NextResponse.json(results);
}
