import { db } from '@/db';
import { pages, chartSettings, visualizationResults } from '@/db/schema';
import { count } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  if (!db) {
    return <div><h1 className="mb-6 text-2xl font-bold">관리자 대시보드</h1><p className="text-muted-foreground">데이터베이스가 연결되지 않았습니다.</p></div>;
  }
  const [pageCount] = await db.select({ count: count() }).from(pages);
  const [chartCount] = await db
    .select({ count: count() })
    .from(chartSettings);
  const [dataCount] = await db
    .select({ count: count() })
    .from(visualizationResults);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">관리자 대시보드</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">콘텐츠 페이지</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pageCount.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">차트 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{chartCount.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">시각화 데이터</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dataCount.count}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
