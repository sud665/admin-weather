import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function MethodologyPage() {
  const page = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, 'about/methodology'))
    .limit(1);
  const content = page[0];

  return (
    <div>
      <h1 className="text-3xl font-bold">{content?.title || '모형 개요'}</h1>
      <div className="mt-6 whitespace-pre-wrap">
        {content?.content || '콘텐츠가 준비 중입니다.'}
      </div>
    </div>
  );
}
