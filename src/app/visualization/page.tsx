'use client';

import { useState } from 'react';
import { VariablePanel } from '@/components/visualization/variable-panel';
import { ChartArea } from '@/components/visualization/chart-area';

export default function VisualizationPage() {
  const [combination, setCombination] = useState('default');

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">
        기후변화 피해비용 데이터 시각화
      </h1>
      <div className="flex gap-6">
        {/* 좌측: 변수 선택 패널 */}
        <aside className="w-72 shrink-0 rounded-lg border bg-card">
          <VariablePanel onCombinationChange={setCombination} />
        </aside>

        {/* 우측: 차트 영역 */}
        <section className="min-w-0 flex-1">
          <ChartArea combination={combination} />
        </section>
      </div>
    </div>
  );
}
