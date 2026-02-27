'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: '홈' },
  { href: '/visualization', label: '데이터 시각화' },
  { href: '/about', label: '플랫폼 소개' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
