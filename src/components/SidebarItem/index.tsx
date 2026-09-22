'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrashButton } from '../Buttons/TrashButton/page';
import { NewPageButton } from '../Buttons/NewPageButton/page';

// Row geometry, shared with PageTree so the disclosure arrow and the drag drop
// indicator sit on the same ladder as the row they belong to.
export const INDENT = 20;
export const ROW_PAD = 8; // matches the Link's px-2

export function SidebarItem({ href, icon, label, depth = 0, pageId, disclosure }: { href: string; icon: React.ReactNode; label: string; depth?: number; pageId?: string; disclosure?: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <div className={`group relative flex w-full items-center overflow-clip rounded-md ${active ? 'bg-active text-ink' : 'text-ink-secondary hover:bg-hover'}`} style={{ paddingLeft: depth * INDENT }}>
      {/* Lies exactly on top of the icon slot below — hovering the row swaps one
          for the other, so the arrow costs no horizontal space. */}
      {disclosure && (
        <span className="absolute top-1/2 z-10 flex size-5 -translate-y-1/2 items-center justify-center" style={{ left: depth * INDENT + ROW_PAD }}>
          {disclosure}
        </span>
      )}
      <Link href={href} draggable={false} className={`flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm/5 font-medium transition-colors`}>
        <span className={`flex size-5 shrink-0 items-center justify-center ${disclosure ? 'transition-opacity group-hover:opacity-0 group-has-[[data-disclosure]:focus-visible]:opacity-0' : ''}`}>{icon}</span>
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
