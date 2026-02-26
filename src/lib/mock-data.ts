// seed 스크립트 기반 목업 데이터 — DATABASE_URL 없을 때 fallback용

const setId = (n: number) => `mock-set-${n}`;
const paramId = (s: number, p: number) => `mock-param-${s}-${p}`;
const valueId = (s: number, p: number, v: number) => `mock-val-${s}-${p}-${v}`;

const subParamConfigs = [
  {
    setIndex: 0,
    params: [
      {
        name: '순시간선호율 (PRTP)',
        values: [
          { label: '0.1%', value: 0.001 },
          { label: '1.5%', value: 0.015 },
          { label: '3.0%', value: 0.03 },
        ],
      },
      {
        name: '소비탄력성 (η)',
        values: [
          { label: '1.0', value: 1.0 },
          { label: '1.5', value: 1.5 },
          { label: '2.0', value: 2.0 },
        ],
      },
      {
        name: '성장률 조정',
        values: [
          { label: '저성장', value: 0.01 },
          { label: '기준', value: 0.02 },
          { label: '고성장', value: 0.03 },
        ],
      },
    ],
  },
  {
    setIndex: 1,
    params: [
      {
        name: 'SSP-RCP 시나리오',
        values: [
          { label: 'SSP1-2.6', value: 2.6 },
          { label: 'SSP2-4.5', value: 4.5 },
          { label: 'SSP5-8.5', value: 8.5 },
        ],
      },
      {
        name: '기후민감도 (ECS)',
        values: [
          { label: '2.0°C', value: 2.0 },
          { label: '3.0°C', value: 3.0 },
          { label: '4.5°C', value: 4.5 },
        ],
      },
      {
        name: '탄소순환 모델',
        values: [
          { label: '보수적', value: 1 },
          { label: '중간', value: 2 },
          { label: '적극적', value: 3 },
        ],
      },
    ],
  },
  {
    setIndex: 2,
    params: [
      {
        name: '피해함수 유형',
        values: [
          { label: 'Howard-Sterner', value: 1 },
          { label: 'DICE-2016', value: 2 },
          { label: 'Burke et al.', value: 3 },
        ],
      },
      {
        name: '지역 가중치',
        values: [
          { label: '균등', value: 1 },
          { label: 'GDP 가중', value: 2 },
          { label: '인구 가중', value: 3 },
        ],
      },
      {
        name: '비선형 정도',
        values: [
          { label: '선형', value: 1 },
          { label: '이차', value: 2 },
          { label: '지수', value: 3 },
        ],
      },
    ],
  },
  {
    setIndex: 3,
    params: [
      {
        name: 'GDP 성장률',
        values: [
          { label: '저성장', value: 0.015 },
          { label: '중간', value: 0.025 },
          { label: '고성장', value: 0.04 },
        ],
      },
      {
        name: '인구 전망',
        values: [
          { label: '감소', value: -0.005 },
          { label: '안정', value: 0.0 },
          { label: '증가', value: 0.005 },
        ],
      },
      {
        name: '기술 발전',
        values: [
          { label: '점진적', value: 1 },
          { label: '기준', value: 2 },
          { label: '혁신적', value: 3 },
        ],
      },
    ],
  },
];

const sets = [
  { id: setId(0), name: '할인율', description: '미래 피해의 현재가치 환산 관련 파라미터', order: 1 },
  { id: setId(1), name: '기후 시나리오', description: '온실가스 배출 경로 및 기후 민감도', order: 2 },
  { id: setId(2), name: '피해함수', description: '기온 상승에 따른 경제적 피해 관계', order: 3 },
  { id: setId(3), name: '사회경제 경로', description: 'GDP, 인구, 기술 발전 전망', order: 4 },
];

export const mockVariableSets = sets.map((s, si) => ({
  ...s,
  subParameters: subParamConfigs[si].params.map((p, pi) => ({
    id: paramId(si, pi),
    setId: s.id,
    name: p.name,
    description: null,
    order: pi + 1,
    values: p.values.map((v, vi) => ({
      id: valueId(si, pi, vi),
      subParameterId: paramId(si, pi),
      label: v.label,
      value: v.value,
      description: null,
      order: vi + 1,
    })),
  })),
}));

export const mockChartSettings = [
  {
    id: 'mock-chart-1',
    chartKey: 'scc-timeline',
    title: '탄소의 사회적 비용 (SCC) 시계열',
    xLabel: '연도',
    yLabel: 'SCC ($/tCO₂)',
    unit: '$/tCO₂',
    description: '시간에 따른 탄소의 사회적 비용 변화 추이',
    updatedAt: null,
  },
  {
    id: 'mock-chart-2',
    chartKey: 'scenario-comparison',
    title: '시나리오별 피해비용 비교',
    xLabel: '시나리오',
    yLabel: '피해비용',
    unit: '조 원',
    description: '각 시나리오별 누적 피해비용 비교',
    updatedAt: null,
  },
  {
    id: 'mock-chart-3',
    chartKey: 'temp-damage',
    title: '기온 상승 vs 경제적 피해',
    xLabel: '기온 상승 (°C)',
    yLabel: 'GDP 손실 (%)',
    unit: '%',
    description: '기온 상승 정도에 따른 GDP 손실률',
    updatedAt: null,
  },
  {
    id: 'mock-chart-4',
    chartKey: 'damage-distribution',
    title: '피해비용 확률 분포',
    xLabel: '피해비용 (조 원)',
    yLabel: '빈도',
    unit: '',
    description: '피해비용의 확률적 분포',
    updatedAt: null,
  },
];

function generateVisualizationResults() {
  const years = Array.from({ length: 81 }, (_, i) => 2020 + i);
  const combos = ['default', 'high-damage', 'low-discount', 'extreme'] as const;
  const results: Record<string, Array<{
    id: string;
    combinationKey: string;
    year: number;
    sccValue: number;
    temperature: number;
    damageCost: number;
    gdpLoss: number;
    metadata: null;
    createdAt: null;
  }>> = {};

  for (const combo of combos) {
    results[combo] = years.map((year, i) => {
      const baseValue =
        combo === 'default' ? 50 : combo === 'high-damage' ? 120 : combo === 'low-discount' ? 80 : 200;
      const yearFactor = (year - 2020) / 80;

      return {
        id: `mock-viz-${combo}-${year}`,
        combinationKey: combo,
        year,
        sccValue: baseValue * (1 + yearFactor * 2),
        temperature: 1.1 + yearFactor * (combo === 'extreme' ? 4.5 : 2.5),
        damageCost: baseValue * yearFactor * 100,
        gdpLoss: yearFactor * (combo === 'high-damage' ? 8 : 3),
        metadata: null,
        createdAt: null,
      };
    });
  }

  return results;
}

export const mockVisualizationResults = generateVisualizationResults();
