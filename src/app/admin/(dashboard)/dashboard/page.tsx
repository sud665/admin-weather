import { db } from '@/db';
import { pages, chartSettings, visualizationResults } from '@/db/schema';
import { count } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let pageCountVal = 4;
  let chartCountVal = 4;
  let dataCountVal = 324;
  let isDemo = true;

  try {
    if (db) {
      const [pageCount] = await db.select({ count: count() }).from(pages);
      const [chartCount] = await db.select({ count: count() }).from(chartSettings);
      const [dataCount] = await db.select({ count: count() }).from(visualizationResults);
      pageCountVal = pageCount.count;
      chartCountVal = chartCount.count;
      dataCountVal = dataCount.count;
      isDemo = false;
    }
  } catch {
    // DB 연결 실패 시 목업 데이터 사용
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">관리자 대시보드</h1>
      {isDemo && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
          데모 모드: 데이터베이스가 연결되지 않아 샘플 데이터를 표시합니다.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">콘텐츠 페이지</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pageCountVal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">차트 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{chartCountVal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">시각화 데이터</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dataCountVal}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
