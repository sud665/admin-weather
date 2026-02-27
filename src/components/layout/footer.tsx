import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold">
              EcoVision 통합 환경분석 플랫폼
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              EcoVision Research Lab
            </p>
          </div>
          <nav className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/visualization" className="transition-colors hover:text-foreground">
              데이터 시각화
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground">
              플랫폼 소개
            </Link>
            <Link href="/about/methodology" className="transition-colors hover:text-foreground">
              분석 방법론
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} EcoVision Analytics Inc. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
