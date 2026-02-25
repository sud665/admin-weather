'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ChartSetting } from '@/lib/types';

export default function VisualizationSettingsPage() {
  const [settings, setSettings] = useState<ChartSetting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ChartSetting>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/chart-settings')
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  const startEdit = (setting: ChartSetting) => {
    setEditingId(setting.id);
    setForm(setting);
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    const res = await fetch(`/api/admin/chart-settings/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const updated = await res.json();
    setSettings(settings.map((s) => (s.id === editingId ? updated : s)));
    setEditingId(null);
    setSaving(false);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">시각화 설정 관리</h1>
      <div className="space-y-4">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <CardTitle className="text-base">{setting.chartKey}</CardTitle>
            </CardHeader>
            <CardContent>
              {editingId === setting.id ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">제목</Label>
                    <Input
                      value={form.title || ''}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">X축 레이블</Label>
                      <Input
                        value={form.xLabel || ''}
                        onChange={(e) =>
                          setForm({ ...form, xLabel: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Y축 레이블</Label>
                      <Input
                        value={form.yLabel || ''}
                        onChange={(e) =>
                          setForm({ ...form, yLabel: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">단위</Label>
                      <Input
                        value={form.unit || ''}
                        onChange={(e) =>
                          setForm({ ...form, unit: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">설명</Label>
                    <Textarea
                      value={form.description || ''}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? '저장 중...' : '저장'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">제목:</span> {setting.title}
                    </p>
                    <p>
                      <span className="font-medium">축:</span> {setting.xLabel}{' '}
                      / {setting.yLabel} ({setting.unit})
                    </p>
                    {setting.description && (
                      <p className="text-muted-foreground">
                        {setting.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(setting)}
                  >
                    편집
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
