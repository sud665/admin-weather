import Link from 'next/link';
import { NavLinks } from './nav-links';
import { ThemeToggle } from '@/components/theme-toggle';
import { Globe } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 dark:bg-emerald-500">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">EcoVision Analytics</span>
        </Link>
        <div className="flex items-center gap-1">
          <NavLinks />
          <div className="ml-2 border-l pl-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
