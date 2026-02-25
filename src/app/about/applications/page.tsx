import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  const page = db
    ? await db
        .select()
        .from(pages)
        .where(eq(pages.slug, 'about/applications'))
        .limit(1)
    : [];
  const content = page[0];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">{content?.title || '활용 방안'}</h1>
      <div className="mt-1 h-1 w-12 rounded-full bg-emerald-500" />
      <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
        {content?.content || '콘텐츠가 준비 중입니다.'}
      </div>
    </div>
  );
}
