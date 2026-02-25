'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { VisualizationResult, ChartSetting } from '@/lib/types';

interface Props {
  data: VisualizationResult[];
  setting?: ChartSetting;
}

export function ScenarioBarChart({ data, setting }: Props) {
  const chartData = data
    .filter((d) => d.year % 10 === 3)
    .map((d) => ({
      year: d.year.toString(),
      damageCost: d.damageCost ? Math.round(d.damageCost) : 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {setting?.title || '시나리오별 피해비용'}
        </CardTitle>
        {setting?.description && (
          <CardDescription className="text-xs">
            {setting.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar
              dataKey="damageCost"
              name="피해비용"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
