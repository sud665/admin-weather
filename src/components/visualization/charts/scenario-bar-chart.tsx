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
import { useChartColors } from '@/hooks/use-chart-colors';
import type { VisualizationResult, ChartSetting } from '@/lib/types';

interface Props {
  data: VisualizationResult[];
  setting?: ChartSetting;
}

export function ScenarioBarChart({ data, setting }: Props) {
  const colors = useChartColors();
  const chartData = data
    .filter((d) => d.year % 10 === 0)
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
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="year" fontSize={12} tick={{ fill: colors.text }} />
            <YAxis fontSize={12} tick={{ fill: colors.text }} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltip.bg,
                borderColor: colors.tooltip.border,
                color: colors.tooltip.text,
              }}
            />
            <Bar
              dataKey="damageCost"
              name="피해비용"
              fill={colors.bar}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
