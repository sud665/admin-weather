import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  let page: { title?: string; content?: string | null }[] = [];
  try {
    if (db) {
      page = await db
        .select()
        .from(pages)
        .where(eq(pages.slug, 'about'))
        .limit(1);
    }
  } catch {}
  const content = page[0];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">
        {content?.title || '플랫폼 소개'}
      </h1>
      <div className="mt-1 h-1 w-12 rounded-full bg-emerald-500" />
      <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
        {content?.content || 'EcoVision 통합 환경분석 플랫폼은 EcoVision Research Lab에서 개발되었습니다.\n\n탄소의 사회적 비용(SCC) 추정 기술을 고도화하여, 환경 대응 정책 수립에 과학적 근거를 제공합니다.\n\n본 플랫폼은 다양한 환경 시나리오와 경제적 변수를 조합하여 사전 계산된 결과를 인터랙티브 시각화로 제공합니다. 사용자는 할인율, 기후 시나리오, 피해함수, 사회경제 경로 등 주요 변수를 자유롭게 선택하고, 그에 따른 결과를 실시간으로 비교·분석할 수 있습니다.'}
      </div>
    </div>
  );
}
