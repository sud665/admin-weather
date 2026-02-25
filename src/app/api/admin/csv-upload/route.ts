import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import {
  visualizationResults,
  variableSets,
  subParameters,
  parameterValues,
} from '@/db/schema';
import Papa from 'papaparse';
import { sql } from 'drizzle-orm';

interface ResultRow {
  combinationKey: string;
  year: string;
  sccValue: string;
  temperature: string;
  damageCost: string;
  gdpLoss: string;
}

interface VariableRow {
  setName: string;
  setDescription: string;
  setOrder: string;
  paramName: string;
  paramOrder: string;
  valueLabel: string;
  value: string;
  valueOrder: string;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'CSV 파일이 필요합니다' }, { status: 400 });
    }
    if (!type || !['results', 'variables'].includes(type)) {
      return NextResponse.json(
        { error: '유효한 타입을 지정해주세요 (results | variables)' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const { data, errors } = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV 파싱 오류', details: errors.slice(0, 5) },
        { status: 400 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json({ error: 'CSV 데이터가 비어있습니다' }, { status: 400 });
    }

    if (type === 'results') {
      return await handleResults(data as unknown as ResultRow[]);
    } else {
      return await handleVariables(data as unknown as VariableRow[]);
    }
  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json(
      { error: '업로드 처리 중 오류가 발생했습니다', details: String(error) },
      { status: 500 }
    );
  }
}

async function handleResults(rows: ResultRow[]) {
  const requiredCols = ['combinationKey', 'year', 'sccValue', 'temperature', 'damageCost', 'gdpLoss'];
  const firstRow = rows[0];
  const missing = requiredCols.filter((col) => !(col in firstRow));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `필수 컬럼이 누락되었습니다: ${missing.join(', ')}` },
      { status: 400 }
    );
  }

  await db.transaction(async (tx) => {
    await tx.delete(visualizationResults);

    const batchSize = 500;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize).map((row) => ({
        combinationKey: row.combinationKey,
        year: parseInt(row.year, 10),
        sccValue: parseFloat(row.sccValue),
        temperature: parseFloat(row.temperature),
        damageCost: parseFloat(row.damageCost),
        gdpLoss: parseFloat(row.gdpLoss),
      }));
      await tx.insert(visualizationResults).values(batch);
    }
  });

  return NextResponse.json({
    success: true,
    message: `시각화 결과 ${rows.length}건이 업로드되었습니다`,
    count: rows.length,
  });
}

async function handleVariables(rows: VariableRow[]) {
  const requiredCols = ['setName', 'setDescription', 'setOrder', 'paramName', 'paramOrder', 'valueLabel', 'value', 'valueOrder'];
  const firstRow = rows[0];
  const missing = requiredCols.filter((col) => !(col in firstRow));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `필수 컬럼이 누락되었습니다: ${missing.join(', ')}` },
      { status: 400 }
    );
  }

  await db.transaction(async (tx) => {
    await tx.execute(sql`DELETE FROM parameter_values`);
    await tx.execute(sql`DELETE FROM sub_parameters`);
    await tx.delete(variableSets);

    const setMap = new Map<string, string>();
    const paramMap = new Map<string, string>();

    for (const row of rows) {
      const setKey = row.setName;
      if (!setMap.has(setKey)) {
        const [inserted] = await tx
          .insert(variableSets)
          .values({
            name: row.setName,
            description: row.setDescription || null,
            order: parseInt(row.setOrder, 10) || 0,
          })
          .returning({ id: variableSets.id });
        setMap.set(setKey, inserted.id);
      }

      const paramKey = `${row.setName}__${row.paramName}`;
      if (!paramMap.has(paramKey)) {
        const [inserted] = await tx
          .insert(subParameters)
          .values({
            setId: setMap.get(setKey)!,
            name: row.paramName,
            order: parseInt(row.paramOrder, 10) || 0,
          })
          .returning({ id: subParameters.id });
        paramMap.set(paramKey, inserted.id);
      }

      await tx.insert(parameterValues).values({
        subParameterId: paramMap.get(paramKey)!,
        label: row.valueLabel,
        value: parseFloat(row.value),
        order: parseInt(row.valueOrder, 10) || 0,
      });
    }
  });

  return NextResponse.json({
    success: true,
    message: `변수 정의 ${rows.length}건이 업로드되었습니다`,
    count: rows.length,
  });
}
