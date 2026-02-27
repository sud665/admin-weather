import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function MethodologyPage() {
  let page: { title?: string; content?: string | null }[] = [];
  try {
    if (db) {
      page = await db
        .select()
        .from(pages)
        .where(eq(pages.slug, 'about/methodology'))
        .limit(1);
    }
  } catch {}
  const content = page[0];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">{content?.title || '분석 방법론'}</h1>
      <div className="mt-1 h-1 w-12 rounded-full bg-emerald-500" />
      <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
        {content?.content || '본 모형은 세 가지 핵심 모듈로 구성됩니다:\n\n1. 기후 모듈: 온실가스 배출에 따른 대기 농도 변화와 기온 상승을 시뮬레이션합니다.\n2. 경제 모듈: GDP 성장, 인구 변화, 기술 발전 등 거시경제 변수를 예측합니다.\n3. 피해 모듈: 기온 상승이 다양한 부문(농업, 보건, 인프라 등)에 미치는 경제적 피해를 산정합니다.\n\n각 모듈은 독립적으로 파라미터를 조정할 수 있으며, 앙상블 방식으로 결합하여 불확실성을 체계적으로 반영합니다. 사용자는 할인율, 기후민감도, 피해함수 유형 등 핵심 변수를 선택하여 다양한 시나리오를 탐색할 수 있습니다.'}
      </div>
    </div>
  );
}
