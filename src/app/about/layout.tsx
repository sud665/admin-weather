import { AboutSidebar } from '@/components/about/about-sidebar';

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="w-48 shrink-0">
          <AboutSidebar />
        </aside>
        <article className="min-w-0 flex-1 prose prose-neutral max-w-none">
          {children}
        </article>
      </div>
    </div>
  );
}
