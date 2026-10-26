'use client';

import { useEffect, useState } from 'react';
import { Menu, X, PanelLeft } from 'lucide-react';
import { sidebarActions, sidebarStore } from '@/src/stores/sidebar';
import { clampSidebarWidth } from '@/src/lib/sidebar';
import { TOOLBAR_BUTTON, TOOLBAR_ROW } from '@/src/lib/toolbar';

export function SidebarShell({ sidebar, initialCollapsed, initialWidth, children }: { sidebar: React.ReactNode; initialCollapsed: boolean; initialWidth: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  // null until the first toggle / drag, so server render and hydration both use the cookie values.
  const collapsed = sidebarStore((s) => s.collapsed) ?? initialCollapsed;
  const width = sidebarStore((s) => s.width) ?? initialWidth;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === '\\' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        sidebarActions.toggleCollapsed(initialCollapsed);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [initialCollapsed]);

  return (
    <div className="flex size-full">
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-ink/20 md:hidden" aria-hidden />}

      {/* Width goes through a CSS variable so only `md:` reads it — the mobile drawer keeps w-70. */}
      <div
        onClick={(e) => {
          if (open && (e.target as HTMLElement).closest('a, button')) setOpen(false);
        }}
        style={{ '--sidebar-w': `${width}px` } as React.CSSProperties}
        className={`fixed inset-y-0 left-0 z-50 flex w-70 shrink-0 flex-col overflow-hidden border-r border-neutral-200 bg-canvas transition-transform duration-200 ease-out md:relative md:z-auto md:translate-x-0 ${dragging ? 'md:transition-none' : 'md:transition-[width]'} ${open ? 'translate-x-0 shadow-overlay' : '-translate-x-full'} ${collapsed ? 'md:w-0 md:border-r-0' : 'md:w-(--sidebar-w)'}`}>
        <div className="flex h-12 shrink-0 items-center justify-end px-3 md:hidden">
          <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="flex size-8 items-center justify-center rounded-md text-ink-secondary hover:bg-hover">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 w-70 flex-1 md:w-(--sidebar-w)">{sidebar}</div>
        {/* Resize handle. Pointer capture keeps moves coming here even once the cursor
            leaves the handle, so no window listeners to add or clean up. */}
        <div
          aria-hidden
          onPointerDown={(e) => {
            e.preventDefault(); // no text selection mid-drag
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
          }}
          onPointerMove={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return; // plain hover, not a drag
            // The sidebar starts at x=0, so the pointer's x is the width.
            sidebarActions.setWidth(clampSidebarWidth(e.clientX));
          }}
          onPointerUp={() => {
            setDragging(false);
            sidebarActions.saveWidth();
          }}
          className={`absolute inset-y-0 right-0 hidden w-1.5 cursor-col-resize transition-colors md:block hover:bg-hover ${dragging ? 'bg-hover' : ''}`}
        />
      </div>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Left end of the toolbar line; the page's actions hold the right end. */}
        <div className={`${TOOLBAR_ROW} left-4`}>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open} className={`${TOOLBAR_BUTTON} flex md:hidden`}>
            <Menu className="size-4" />
          </button>
          <button type="button" onClick={() => sidebarActions.toggleCollapsed(initialCollapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} className={`${TOOLBAR_BUTTON} hidden cursor-pointer md:flex`}>
            <PanelLeft className="size-4" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
