import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  let page: { title?: string; content?: string | null }[] = [];
  try {
    if (db) {
      page = await db
        .select()
        .from(pages)
        .where(eq(pages.slug, 'about/applications'))
        .limit(1);
    }
  } catch {}
  const content = page[0];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">{content?.title || '활용 방안'}</h1>
      <div className="mt-1 h-1 w-12 rounded-full bg-emerald-500" />
      <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
        {content?.content || '본 플랫폼의 분석 결과는 다음과 같은 분야에 활용됩니다:\n\n• 탄소세 및 배출권 거래제의 적정 가격 산정\n• 환경 변화 적응 투자의 비용-편익 분석\n• 국가 온실가스 감축 목표(NDC) 수립 지원\n• 환경 리스크 공시 및 금융 규제 기초자료\n\n정책 입안자, 연구자, 시민 모두가 데이터에 기반한 의사결정을 내릴 수 있도록, 투명하고 접근성 높은 시각화를 제공합니다.'}
      </div>
    </div>
  );
}
