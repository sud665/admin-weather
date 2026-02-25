'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

const adminLinks = [
  { href: '/admin/dashboard', label: '대시보드' },
  { href: '/admin/content', label: '콘텐츠 관리' },
  { href: '/admin/visualization', label: '시각화 설정' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r bg-muted/30 p-4">
      <h2 className="mb-6 text-lg font-bold">관리자</h2>
      <nav className="flex-1 space-y-1">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'block rounded-md px-3 py-2 text-sm transition-colors',
              pathname.startsWith(link.href)
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: '/' })}
      >
        로그아웃
      </Button>
    </aside>
  );
}
