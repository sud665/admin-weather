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

export default async function ContentListPage() {
  const allPages = await db.select().from(pages);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">콘텐츠 관리</h1>
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
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/content/${page.id}`}>편집</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
