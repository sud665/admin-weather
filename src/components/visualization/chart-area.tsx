'use client';

import { useVisualizationData } from '@/hooks/use-visualization-data';
import { SccLineChart } from './charts/scc-line-chart';
import { ScenarioBarChart } from './charts/scenario-bar-chart';
import { TempDamageScatter } from './charts/temp-damage-scatter';
import { DataTableView } from './charts/data-table-view';

interface Props {
  combination: string;
}

export function ChartArea({ combination }: Props) {
  const { data, getSetting, loading } = useVisualizationData(combination);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-muted-foreground">데이터 로딩 중...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          선택한 조합에 해당하는 데이터가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SccLineChart data={data} setting={getSetting('scc-timeline')} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ScenarioBarChart
          data={data}
          setting={getSetting('scenario-comparison')}
        />
        <TempDamageScatter
          data={data}
          setting={getSetting('temp-damage')}
        />
      </div>
      <DataTableView data={data} />
    </div>
  );
}
