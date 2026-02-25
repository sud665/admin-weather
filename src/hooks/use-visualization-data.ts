'use client';

import { useEffect, useState } from 'react';
import type { VisualizationResult, ChartSetting } from '@/lib/types';

export function useVisualizationData(combination: string) {
  const [data, setData] = useState<VisualizationResult[]>([]);
  const [chartSettings, setChartSettings] = useState<ChartSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/visualization?combination=${combination}`).then((r) =>
        r.json()
      ),
      fetch('/api/chart-settings').then((r) => r.json()),
    ]).then(([vizData, settings]) => {
      setData(vizData);
      setChartSettings(settings);
      setLoading(false);
    });
  }, [combination]);

  const getSetting = (key: string) =>
    chartSettings.find((s) => s.chartKey === key);

  return { data, chartSettings, getSetting, loading };
}
