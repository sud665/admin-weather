import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chartSettings } from '@/db/schema';

export async function GET() {
  const settings = await db.select().from(chartSettings);
  return NextResponse.json(settings);
}
