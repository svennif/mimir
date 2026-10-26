import { FileText, House, Plus, Settings, Trash2 /* Search, ChevronDown, MoreHorizontal */ } from 'lucide-react';
import { SidebarItem } from '../SidebarItem';
import { NewPageButton } from '../Buttons/NewPageButton/page';
import { SidebarTree } from './SidebarTree';
import type { PageNode } from '@/src/lib/tree';

type Favourite = { id: string; title: string; icon: string | null };

export function Sidebar({ tree, favourites, name }: { tree: PageNode[]; favourites: Favourite[]; name: string | null }) {
  // Falls back to the app's name until one is set on the Settings page.
  const label = name ?? 'Mimir';

  return (
    <aside className="flex h-full w-full flex-col items-start overflow-clip px-2 pt-3.5 pb-4">
      {/* Workspace switcher */}
      <div className="flex w-full items-center gap-2 overflow-clip px-2 py-1.5">
        <div className="flex size-5.5 shrink-0 items-center justify-center overflow-clip rounded-[11px] bg-accent text-[13px] font-semibold text-ink-inverse">{label[0].toUpperCase()}</div>
        <p className="min-w-0 flex-1 truncate text-sm/5 font-semibold text-ink">{label}</p>
        {/* <ChevronDown className="size-4 shrink-0 text-ink-secondary" />
        <MoreHorizontal className="size-4 shrink-0 text-ink-secondary" /> */}
      </div>
      {/* Menu */}
      <nav className="flex w-full flex-col items-start gap-px overflow-clip py-2">
        <SidebarItem href="/" icon={<House className="size-4" />} label="Home" />
        {/* Currently not being displayed as it's not set up */}
        {/* <SidebarItem href="/search" icon={<Search className="size-4" />} label="Search" /> */}
      </nav>
      {/* Favourites — capped and scrolling on its own, so a long list can't
          squeeze the page tree out of view. */}
      {favourites.length > 0 && (
        <div className="flex max-h-60 w-full shrink-0 flex-col items-start gap-px overflow-y-auto pt-3">
          <div className="flex w-full items-start overflow-clip px-2 py-1">
            <p className="text-xs/4 font-medium text-ink-tertiary">Favourites</p>
          </div>
          {favourites.map((page) => (
            <SidebarItem key={page.id} href={`/pages/${page.id}`} icon={page.icon ? <span className="text-sm leading-none">{page.icon}</span> : <FileText className="size-4" />} label={page.title || 'Untitled'} />
          ))}
        </div>
      )}
      {/* Pages. Content height, not flex-1: it grows with the tree until it
          meets the footer, then min-h-0 lets it shrink and the tree scrolls. */}
      <div className="flex min-h-0 w-full flex-col items-start gap-px overflow-clip pt-3">
        <div className="flex w-full items-start overflow-clip px-2 py-1">
          <p className="text-xs/4 font-medium text-ink-tertiary">Pages</p>
        </div>
        <SidebarTree nodes={tree} />
        <NewPageButton className="flex h-8 w-full items-center gap-2 rounded-md cursor-pointer px-2 py-1.5 text-sm/5 font-medium text-ink-secondary transition-colors hover:bg-hover" icon={<Plus className="size-4" />} label="Add a page" />
      </div>
      {/* Footer — mt-auto pins it to the bottom in place of a spacer div */}
      <nav className="mt-auto flex w-full flex-col items-start gap-px overflow-clip pt-2">
        <SidebarItem href="/settings" icon={<Settings className="size-4" />} label="Settings" />
        <SidebarItem href="/trash" icon={<Trash2 className="size-4" />} label="Trash" />
      </nav>
    </aside>
  );
}
