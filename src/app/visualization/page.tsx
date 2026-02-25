'use client';

import { useState } from 'react';
import { VariablePanel } from '@/components/visualization/variable-panel';

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

        {/* 우측: 차트 영역 (Task 9에서 구현) */}
        <section className="min-w-0 flex-1 space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              선택된 조합:{' '}
              <code className="rounded bg-muted px-1.5 py-0.5">
                {combination}
              </code>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              차트가 여기에 표시됩니다.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
