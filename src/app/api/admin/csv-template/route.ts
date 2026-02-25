import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const TEMPLATES: Record<string, { filename: string; content: string }> = {
  results: {
    filename: 'results_template.csv',
    content: `combinationKey,year,sccValue,temperature,damageCost,gdpLoss
discount_low__scenario_ssp126__damage_howard__socio_ssp1,2025,45.2,1.1,120.5,0.8
discount_low__scenario_ssp126__damage_howard__socio_ssp1,2030,52.8,1.3,145.2,1.1`,
  },
  variables: {
    filename: 'variables_template.csv',
    content: `setName,setDescription,setOrder,paramName,paramOrder,valueLabel,value,valueOrder
할인율,할인율 시나리오,1,할인율,1,저,1.5,1
할인율,할인율 시나리오,1,할인율,1,중,2.0,2`,
  },
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get('type');
  if (!type || !TEMPLATES[type]) {
    return NextResponse.json(
      { error: '유효한 타입을 지정해주세요 (results | variables)' },
      { status: 400 }
    );
  }

  const template = TEMPLATES[type];
  return new NextResponse(template.content, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${template.filename}"`,
    },
  });
}
