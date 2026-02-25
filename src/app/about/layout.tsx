import { AboutSidebar } from '@/components/about/about-sidebar';

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-10">
        <aside className="w-48 shrink-0">
          <div className="sticky top-20">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              모델 문서
            </p>
            <AboutSidebar />
          </div>
        </aside>
        <article className="min-w-0 flex-1 max-w-none">
          {children}
        </article>
      </div>
    </div>
  );
}
