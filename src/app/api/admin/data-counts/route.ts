import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import {
  visualizationResults,
  variableSets,
  subParameters,
  parameterValues,
} from '@/db/schema';
import { count } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const [results] = await db.select({ count: count() }).from(visualizationResults);
  const [variables] = await db.select({ count: count() }).from(variableSets);
  const [params] = await db.select({ count: count() }).from(subParameters);
  const [values] = await db.select({ count: count() }).from(parameterValues);

  return NextResponse.json({
    results: results.count,
    variables: variables.count,
    parameters: params.count,
    values: values.count,
  });
}
