'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
}

export default function ContentEditPage() {
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState<PageData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pages')
      .then((r) => r.json())
      .then((pages: PageData[]) => {
        const found = pages.find((p) => p.id === params.slug);
        if (found) setPage(found);
      });
  }, [params.slug]);

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    await fetch(`/api/admin/pages/${page.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: page.title,
        content: page.content,
        published: page.published,
      }),
    });
    setSaving(false);
    router.push('/admin/content');
  };

  if (!page) return <p>로딩 중...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">콘텐츠 편집</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">/{page.slug}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>제목</Label>
            <Input
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>내용</Label>
            <Textarea
              value={page.content}
              onChange={(e) => setPage({ ...page, content: e.target.value })}
              rows={15}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={page.published}
              onChange={(e) =>
                setPage({ ...page, published: e.target.checked })
              }
            />
            <Label htmlFor="published">공개</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/content')}
            >
              취소
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
