import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding database...');

  // 1. 변수 세트 생성
  const sets = await db
    .insert(schema.variableSets)
    .values([
      { name: '할인율', description: '미래 피해의 현재가치 환산 관련 파라미터', order: 1 },
      { name: '기후 시나리오', description: '온실가스 배출 경로 및 기후 민감도', order: 2 },
      { name: '피해함수', description: '기온 상승에 따른 경제적 피해 관계', order: 3 },
      { name: '사회경제 경로', description: 'GDP, 인구, 기술 발전 전망', order: 4 },
    ])
    .returning();
  console.log(`  ✓ ${sets.length}개 변수 세트 생성`);

  // 2. 각 세트별 하위 파라미터 + 값 생성
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

  let totalSubParams = 0;
  let totalValues = 0;

  for (const cfg of subParamConfigs) {
    for (const param of cfg.params) {
      const [subParam] = await db
        .insert(schema.subParameters)
        .values({
          setId: sets[cfg.setIndex].id,
          name: param.name,
          order: cfg.params.indexOf(param) + 1,
        })
        .returning();
      totalSubParams++;

      for (let v = 0; v < param.values.length; v++) {
        await db.insert(schema.parameterValues).values({
          subParameterId: subParam.id,
          label: param.values[v].label,
          value: param.values[v].value,
          order: v + 1,
        });
        totalValues++;
      }
    }
  }
  console.log(`  ✓ ${totalSubParams}개 하위 파라미터, ${totalValues}개 값 생성`);

  // 3. 목업 시각화 결과 생성 (2020~2100, 매년)
  const years = Array.from({ length: 81 }, (_, i) => 2020 + i);
  const combos = ['default', 'high-damage', 'low-discount', 'extreme'];
  let resultCount = 0;

  for (const combo of combos) {
    const batch = years.map((year) => {
      const baseValue =
        combo === 'default' ? 50 : combo === 'high-damage' ? 120 : combo === 'low-discount' ? 80 : 200;
      const yearFactor = (year - 2020) / 80;

      return {
        combinationKey: combo,
        year,
        sccValue: baseValue * (1 + yearFactor * 2) + (Math.random() - 0.5) * 10,
        temperature: 1.1 + yearFactor * (combo === 'extreme' ? 4.5 : 2.5),
        damageCost: baseValue * yearFactor * 100,
        gdpLoss: yearFactor * (combo === 'high-damage' ? 8 : 3),
      };
    });

    // 81개씩 한 번에 insert
    await db.insert(schema.visualizationResults).values(batch);
    resultCount += batch.length;
  }
  console.log(`  ✓ ${resultCount}개 시각화 결과 생성`);

  // 4. 차트 설정 시드
  await db.insert(schema.chartSettings).values([
    {
      chartKey: 'scc-timeline',
      title: '탄소의 사회적 비용 (SCC) 시계열',
      xLabel: '연도',
      yLabel: 'SCC ($/tCO₂)',
      unit: '$/tCO₂',
      description: '시간에 따른 탄소의 사회적 비용 변화 추이',
    },
    {
      chartKey: 'scenario-comparison',
      title: '시나리오별 피해비용 비교',
      xLabel: '시나리오',
      yLabel: '피해비용',
      unit: '조 원',
      description: '각 시나리오별 누적 피해비용 비교',
    },
    {
      chartKey: 'temp-damage',
      title: '기온 상승 vs 경제적 피해',
      xLabel: '기온 상승 (°C)',
      yLabel: 'GDP 손실 (%)',
      unit: '%',
      description: '기온 상승 정도에 따른 GDP 손실률',
    },
    {
      chartKey: 'damage-distribution',
      title: '피해비용 확률 분포',
      xLabel: '피해비용 (조 원)',
      yLabel: '빈도',
      unit: '',
      description: '피해비용의 확률적 분포',
    },
  ]);
  console.log('  ✓ 4개 차트 설정 생성');

  // 5. CMS 페이지 시드
  await db.insert(schema.pages).values([
    {
      slug: 'about',
      title: '모델 소개',
      content:
        '한국형 앙상블 기후변화통합평가모형(IAM)은 기후에너지환경부의 국가과제로 개발되었습니다.\n\n해외의 탄소의 사회적 비용(SCC) 추정 기술을 국내 상황에 맞게 고도화하여, 한국의 기후변화 대응 정책 수립에 과학적 근거를 제공합니다.',
      published: true,
    },
    {
      slug: 'about/background',
      title: '연구 배경',
      content:
        '기후변화로 인한 경제적 피해를 정량화하는 것은 효과적인 기후정책 수립의 핵심입니다.\n\n본 연구는 해외에서 널리 사용되는 DICE, FUND, PAGE 등의 통합평가모형을 분석하고, 한국의 경제구조와 기후 특성을 반영한 앙상블 모형을 개발하였습니다.',
      published: true,
    },
    {
      slug: 'about/methodology',
      title: '모형 개요',
      content:
        '본 모형은 세 가지 핵심 모듈로 구성됩니다:\n\n1. 기후 모듈: 온실가스 배출에 따른 대기 농도 변화와 기온 상승을 시뮬레이션합니다.\n2. 경제 모듈: GDP 성장, 인구 변화, 기술 발전 등 거시경제 변수를 예측합니다.\n3. 피해 모듈: 기온 상승이 다양한 부문(농업, 보건, 인프라 등)에 미치는 경제적 피해를 산정합니다.',
      published: true,
    },
    {
      slug: 'about/applications',
      title: '활용 방안',
      content:
        '본 모형의 결과는 다음과 같은 정책 분야에 활용됩니다:\n\n• 탄소세 및 배출권 거래제의 적정 가격 산정\n• 기후변화 적응 투자의 비용-편익 분석\n• 국가 온실가스 감축 목표(NDC) 수립 지원\n• 기후 리스크 공시 및 금융 규제 기초자료',
      published: true,
    },
  ]);
  console.log('  ✓ 4개 CMS 페이지 생성');

  console.log('\nSeeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
