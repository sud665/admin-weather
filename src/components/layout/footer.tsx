import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold">
              한국형 앙상블 기후변화통합평가모형
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              기후에너지환경부 국가과제
            </p>
          </div>
          <nav className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/visualization" className="transition-colors hover:text-foreground">
              데이터 시각화
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground">
              모델 소개
            </Link>
            <Link href="/about/methodology" className="transition-colors hover:text-foreground">
              모형 개요
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Climate IAM Research. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
