import { NextResponse } from 'next/server';
import { db } from '@/db';
import { variableSets, subParameters, parameterValues } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { mockVariableSets } from '@/lib/mock-data';

export async function GET() {
  if (!db) {
    return NextResponse.json(mockVariableSets);
  }

  try {
    const sets = await db
      .select()
      .from(variableSets)
      .orderBy(asc(variableSets.order));

    const result = await Promise.all(
      sets.map(async (set) => {
        const params = await db
          .select()
          .from(subParameters)
          .where(eq(subParameters.setId, set.id))
          .orderBy(asc(subParameters.order));

        const paramsWithValues = await Promise.all(
          params.map(async (param) => {
            const values = await db
              .select()
              .from(parameterValues)
              .where(eq(parameterValues.subParameterId, param.id))
              .orderBy(asc(parameterValues.order));
            return { ...param, values };
          })
        );

        return { ...set, subParameters: paramsWithValues };
      })
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(mockVariableSets);
  }
}
