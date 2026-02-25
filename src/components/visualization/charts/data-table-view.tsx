'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { VisualizationResult } from '@/lib/types';

interface Props {
  data: VisualizationResult[];
}

export function DataTableView({ data }: Props) {
  const downloadCSV = () => {
    const headers = [
      '연도',
      'SCC ($/tCO₂)',
      '기온상승 (°C)',
      '피해비용',
      'GDP 손실 (%)',
    ];
    const rows = data.map((d) =>
      [
        d.year,
        d.sccValue?.toFixed(2),
        d.temperature?.toFixed(2),
        d.damageCost?.toFixed(0),
        d.gdpLoss?.toFixed(2),
      ].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'climate-cost-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">상세 데이터</CardTitle>
        <Button variant="outline" size="sm" onClick={downloadCSV}>
          CSV 다운로드
        </Button>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>연도</TableHead>
                <TableHead className="text-right">SCC ($/tCO₂)</TableHead>
                <TableHead className="text-right">기온상승 (°C)</TableHead>
                <TableHead className="text-right">피해비용</TableHead>
                <TableHead className="text-right">GDP 손실 (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell className="text-right">
                    {row.sccValue?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.temperature?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.damageCost?.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.gdpLoss?.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
