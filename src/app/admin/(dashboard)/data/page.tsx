'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  BarChart3,
  Settings2,
} from 'lucide-react';

type UploadType = 'results' | 'variables';
type UploadStatus = 'idle' | 'previewing' | 'uploading' | 'success' | 'error';

interface DataCounts {
  results: number;
  variables: number;
  parameters: number;
  values: number;
}

export default function DataManagementPage() {
  const [uploadType, setUploadType] = useState<UploadType>('results');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [counts, setCounts] = useState<DataCounts | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/data-counts');
      if (res.ok) {
        setCounts(await res.json());
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const parsePreview = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length === 0) return;

      const csvHeaders = lines[0].split(',').map((h) => h.trim());
      setHeaders(csvHeaders);

      const rows = lines.slice(1, 6).map((line) => line.split(',').map((c) => c.trim()));
      setPreview(rows);
      setStatus('previewing');
    };
    reader.readAsText(csvFile);
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setMessage('CSV 파일만 업로드할 수 있습니다');
      setStatus('error');
      return;
    }
    setFile(selectedFile);
    setMessage('');
    parsePreview(selectedFile);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);

      const res = await fetch('/api/admin/csv-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setFile(null);
        setPreview([]);
        setHeaders([]);
        fetchCounts();
      } else {
        setStatus('error');
        setMessage(data.error || '업로드 실패');
      }
    } catch {
      setStatus('error');
      setMessage('네트워크 오류가 발생했습니다');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setHeaders([]);
    setStatus('idle');
    setMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = (type: UploadType) => {
    window.open(`/api/admin/csv-template?type=${type}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">데이터 관리</h1>

      {/* DB 현황 */}
      {counts && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                시각화 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{counts.results.toLocaleString()}건</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                변수 세트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{counts.variables}개</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings2 className="h-4 w-4" />
                파라미터
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{counts.parameters}개</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings2 className="h-4 w-4" />
                파라미터 값
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{counts.values}개</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 업로드 영역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CSV 업로드
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 타입 선택 + 샘플 다운로드 */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>업로드 타입</Label>
              <Select
                value={uploadType}
                onValueChange={(v) => setUploadType(v as UploadType)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="results">시각화 결과</SelectItem>
                  <SelectItem value="variables">변수 정의</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadTemplate(uploadType)}
            >
              <Download className="mr-1.5 h-4 w-4" />
              샘플 CSV 다운로드
            </Button>
          </div>

          {/* 드래그 앤 드롭 영역 */}
          <div
            className={`flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              dragOver
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              CSV 파일을 드래그하거나 클릭하여 선택하세요
            </p>
            {file && (
              <Badge variant="secondary" className="mt-2">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </Badge>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          {/* 미리보기 */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                미리보기 (최대 5행)
              </p>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((h, i) => (
                        <TableHead key={i} className="whitespace-nowrap text-xs">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, ri) => (
                      <TableRow key={ri}>
                        {row.map((cell, ci) => (
                          <TableCell key={ci} className="whitespace-nowrap text-xs">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* 상태 메시지 */}
          {message && (
            <div
              className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                status === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {message}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || status === 'uploading'}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {status === 'uploading' ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-4 w-4" />
                  업로드
                </>
              )}
            </Button>
            {(file || status !== 'idle') && (
              <Button variant="outline" onClick={handleReset}>
                초기화
              </Button>
            )}
          </div>

          {/* 안내 */}
          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium">주의사항</p>
            <ul className="list-inside list-disc space-y-0.5">
              <li>업로드 시 기존 데이터가 모두 교체됩니다</li>
              <li>시각화 결과: combinationKey, year, sccValue, temperature, damageCost, gdpLoss 컬럼 필요</li>
              <li>변수 정의: setName, setDescription, setOrder, paramName, paramOrder, valueLabel, value, valueOrder 컬럼 필요</li>
              <li>샘플 CSV를 다운로드하여 형식을 확인하세요</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
