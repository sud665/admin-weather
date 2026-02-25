'use client';

import {
  ScatterChart,
  Scatter,
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

export function TempDamageScatter({ data, setting }: Props) {
  const chartData = data.map((d) => ({
    temperature: d.temperature
      ? Math.round(d.temperature * 100) / 100
      : 0,
    gdpLoss: d.gdpLoss ? Math.round(d.gdpLoss * 100) / 100 : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {setting?.title || '기온 vs GDP 손실'}
        </CardTitle>
        {setting?.description && (
          <CardDescription className="text-xs">
            {setting.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="temperature"
              name="기온 상승"
              unit="°C"
              fontSize={12}
            />
            <YAxis
              dataKey="gdpLoss"
              name="GDP 손실"
              unit="%"
              fontSize={12}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter
              name="기온-피해"
              data={chartData}
              fill="#ef4444"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
