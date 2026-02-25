'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

export function SccLineChart({ data, setting }: Props) {
  const chartData = data.map((d) => ({
    year: d.year,
    scc: d.sccValue ? Math.round(d.sccValue * 100) / 100 : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {setting?.title || 'SCC 시계열'}
        </CardTitle>
        {setting?.description && (
          <CardDescription className="text-xs">
            {setting.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" fontSize={12} />
            <YAxis
              fontSize={12}
              label={{
                value: setting?.unit || '$/tCO₂',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12 },
              }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="scc"
              name="SCC"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
