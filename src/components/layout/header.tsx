import Link from 'next/link';
import { NavLinks } from './nav-links';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold">기후변화 피해비용 시각화</span>
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
