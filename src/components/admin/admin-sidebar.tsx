'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, FileText, BarChart3, Database, LogOut } from 'lucide-react';

const adminLinks = [
  { href: '/admin/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/content', label: '콘텐츠 관리', icon: FileText },
  { href: '/admin/visualization', label: '시각화 설정', icon: BarChart3 },
  { href: '/admin/data', label: '데이터 관리', icon: Database },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r bg-muted/20">
      <div className="border-b px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          관리자 패널
        </p>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname.startsWith(link.href)
                ? 'bg-emerald-100 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </aside>
  );
}
