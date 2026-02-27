'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const aboutLinks = [
  { href: '/about', label: '플랫폼 소개' },
  { href: '/about/background', label: '연구 배경' },
  { href: '/about/methodology', label: '분석 방법론' },
  { href: '/about/applications', label: '활용 방안' },
];

export function AboutSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {aboutLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'block rounded-md px-3 py-2 text-sm transition-colors',
            pathname === link.href
              ? 'bg-primary/10 font-medium text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
