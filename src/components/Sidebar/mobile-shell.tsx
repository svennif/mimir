'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation" className={`fixed top-4 left-4 z-30 flex size-9 items-center justify-center rounded-md bg-sheet/90 text-ink-secondary backdrop-blur md:hidden ${open ? 'hidden' : ''}`}>
        <Menu className="size-5" />
      </button>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-ink/20 md:hidden" aria-hidden />}

      <div
        onClick={(e) => {
          if (open && (e.target as HTMLElement).closest('a, button')) setOpen(false);
        }}
        className={`fixed inset-y-0 left-0 z-50 flex w-70 flex-col bg-canvas transition-transform duration-200 ease-out md:static md:z-auto md:w-65 md:translate-x-0 md:transition-none ${open ? 'translate-x-0 shadow-overlay' : '-translate-x-full'}`}>
        {/* Mobile-only drawer header — pushes the sidebar down instead of overlapping it */}
        <div className="flex h-12 shrink-0 items-center justify-end px-3 md:hidden">
          <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="flex size-8 items-center justify-center rounded-md text-ink-secondary hover:bg-hover">
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </>
  );
}
