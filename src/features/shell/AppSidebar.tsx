'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Upload, Settings, Plus } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/import', label: 'Import', icon: Upload },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-col border-r border-neutral-200 bg-neutral-50 lg:flex">
      {/* Logo */}
      <div className="flex h-14 items-center px-4">
        <Link href="/dashboard" className="text-lg font-bold text-neutral-900">
          Diagram
        </Link>
      </div>

      {/* New Diagram button */}
      <div className="px-3 pb-2">
        <Link href="/new">
          <Button variant="primary" size="default" className="w-full">
            <Plus className="h-4 w-4" />
            New Diagram
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-neutral-200 p-3">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              rootBox: 'w-full',
              userButtonTrigger: 'w-full justify-start',
            },
          }}
        />
      </div>
    </aside>
  );
}
