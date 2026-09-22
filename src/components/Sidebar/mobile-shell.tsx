'use client';

import { useEffect, useState } from 'react';
import { Menu, X, PanelLeft } from 'lucide-react';
import { sidebarActions, sidebarStore } from '@/src/stores/sidebar';
import { TOOLBAR_BUTTON, TOOLBAR_ROW } from '@/src/lib/toolbar';

export function SidebarShell({ sidebar, initialCollapsed, children }: { sidebar: React.ReactNode; initialCollapsed: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const collapsed = sidebarStore((s) => s.collapsed);

  useState(() => {
    if (initialCollapsed) sidebarStore.setState({ collapsed: true });
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === '\\' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        sidebarActions.toggleCollapsed();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex size-full">
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-ink/20 md:hidden" aria-hidden />}

      <div
        onClick={(e) => {
          if (open && (e.target as HTMLElement).closest('a, button')) setOpen(false);
        }}
        className={`fixed inset-y-0 left-0 z-50 flex w-70 shrink-0 flex-col overflow-hidden border-r border-neutral-200 bg-canvas transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 md:transition-[width] ${open ? 'translate-x-0 shadow-overlay' : '-translate-x-full'} ${collapsed ? 'md:w-0 md:border-r-0' : 'md:w-65'}`}>
        <div className="flex h-12 shrink-0 items-center justify-end px-3 md:hidden">
          <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="flex size-8 items-center justify-center rounded-md text-ink-secondary hover:bg-hover">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 w-70 flex-1 md:w-65">{sidebar}</div>
      </div>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Left end of the toolbar line; the page's actions hold the right end. */}
        <div className={`${TOOLBAR_ROW} left-4`}>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open} className={`${TOOLBAR_BUTTON} flex md:hidden`}>
            <Menu className="size-4" />
          </button>
          <button type="button" onClick={sidebarActions.toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} className={`${TOOLBAR_BUTTON} hidden md:flex`}>
            <PanelLeft className="size-4" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
