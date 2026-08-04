'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrashButton } from '../Buttons/TrashButton/page';
import { NewPageButton } from '../Buttons/NewPageButton/page';

export function SidebarItem({ href, icon, label, depth = 0, pageId }: { href: string; icon: React.ReactNode; label: string; depth?: number; pageId?: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <div className={`group flex w-full items-center overflow-clip rounded-md ${active ? 'bg-active text-ink' : 'text-ink-secondary hover:bg-hover'}`} style={{ paddingLeft: depth * 20 }}>
      <Link href={href} className={`flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm/5 font-medium transition-colors`}>
        <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </Link>
      {pageId && (
        <div className="invisible flex shrink-0 items-center opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <TrashButton pageId={pageId} />
          <NewPageButton parentId={pageId} />
        </div>
      )}
    </div>
  );
}
