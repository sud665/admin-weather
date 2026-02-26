import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chartSettings } from '@/db/schema';
import { mockChartSettings } from '@/lib/mock-data';

export async function GET() {
  if (!db) {
    return NextResponse.json(mockChartSettings);
  }

  const settings = await db.select().from(chartSettings);
  return NextResponse.json(settings);
}
