import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { chartSettings } from '@/db/schema';

const mockChartSettings = [
  {
    id: 'mock-1',
    chartKey: 'scc-timeline',
    title: '탄소의 사회적 비용 (SCC) 시계열',
    xLabel: '연도',
    yLabel: 'SCC ($/tCO₂)',
    unit: '$/tCO₂',
    description: '시간에 따른 탄소의 사회적 비용 변화 추이',
  },
  {
    id: 'mock-2',
    chartKey: 'scenario-comparison',
    title: '시나리오별 피해비용 비교',
    xLabel: '시나리오',
    yLabel: '피해비용',
    unit: '조 원',
    description: '각 시나리오별 누적 피해비용 비교',
  },
  {
    id: 'mock-3',
    chartKey: 'temp-damage',
    title: '기온 상승 vs 경제적 피해',
    xLabel: '기온 상승 (°C)',
    yLabel: 'GDP 손실 (%)',
    unit: '%',
    description: '기온 상승 정도에 따른 GDP 손실률',
  },
  {
    id: 'mock-4',
    chartKey: 'damage-distribution',
    title: '피해비용 확률 분포',
    xLabel: '피해비용 (조 원)',
    yLabel: '빈도',
    unit: '',
    description: '피해비용의 확률적 분포',
  },
];

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (db) {
      const settings = await db.select().from(chartSettings);
      return NextResponse.json(settings);
    }
  } catch {
    // DB 연결 실패 시 목업 데이터 반환
  }

  return NextResponse.json(mockChartSettings);
}
