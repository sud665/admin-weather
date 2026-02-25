'use client';

import { useState } from 'react';
import { VariablePanel } from '@/components/visualization/variable-panel';
import { ChartArea } from '@/components/visualization/chart-area';
import { SlidersHorizontal } from 'lucide-react';

export default function VisualizationPage() {
  const [combination, setCombination] = useState('default');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          기후변화 피해비용 데이터 시각화
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          변수를 조정하여 다양한 시나리오의 피해비용을 비교하세요
        </p>
      </div>
      <div className="flex gap-6">
        {/* 좌측: 변수 선택 패널 */}
        <aside className="w-72 shrink-0 overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">변수 선택</span>
          </div>
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
