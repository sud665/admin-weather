import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function BackgroundPage() {
  let page: { title?: string; content?: string | null }[] = [];
  try {
    if (db) {
      page = await db
        .select()
        .from(pages)
        .where(eq(pages.slug, 'about/background'))
        .limit(1);
    }
  } catch {}
  const content = page[0];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">
        {content?.title || '연구 배경'}
      </h1>
      <div className="mt-1 h-1 w-12 rounded-full bg-emerald-500" />
      <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
        {content?.content || '환경 변화로 인한 경제적 피해를 정량화하는 것은 효과적인 환경 정책 수립의 핵심입니다.\n\n본 연구는 해외에서 널리 사용되는 DICE, FUND, PAGE 등의 통합평가모형을 분석하고, 국내 경제구조와 환경 특성을 반영한 앙상블 모형을 개발하였습니다.\n\n기존 모형들은 글로벌 평균값에 기반하여 지역적 특수성을 충분히 반영하지 못하는 한계가 있었습니다. EcoVision 플랫폼은 이러한 한계를 극복하고, 지역별·부문별 세분화된 피해 추정을 가능하게 합니다.'}
      </div>
    </div>
  );
}
