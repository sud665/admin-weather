import Link from 'next/link';
import { db } from '@/db';
import { pages } from '@/db/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

const mockPages = [
  { id: 'mock-1', title: '플랫폼 소개', slug: 'about', published: true, updatedAt: new Date() },
  { id: 'mock-2', title: '연구 배경', slug: 'about/background', published: true, updatedAt: new Date() },
  { id: 'mock-3', title: '분석 방법론', slug: 'about/methodology', published: true, updatedAt: new Date() },
  { id: 'mock-4', title: '활용 방안', slug: 'about/applications', published: true, updatedAt: new Date() },
];

export default async function ContentListPage() {
  let allPages: { id: string; title: string; slug: string; published: boolean | null; updatedAt: Date | null }[] = mockPages;
  let isDemo = true;

  try {
    if (db) {
      const dbPages = await db.select().from(pages);
      if (dbPages.length > 0) {
        allPages = dbPages;
        isDemo = false;
      }
    }
  } catch {
    // DB 연결 실패 시 목업 데이터 사용
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">콘텐츠 관리</h1>
      {isDemo && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
          데모 모드: 데이터베이스가 연결되지 않아 샘플 데이터를 표시합니다.
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>경로</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>수정일</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allPages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-medium">{page.title}</TableCell>
              <TableCell className="text-muted-foreground">
                /{page.slug}
              </TableCell>
              <TableCell>
                <Badge variant={page.published ? 'default' : 'secondary'}>
                  {page.published ? '공개' : '비공개'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {page.updatedAt?.toLocaleDateString('ko-KR')}
              </TableCell>
              <TableCell>
                {!isDemo && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/content/${page.id}`}>편집</Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
