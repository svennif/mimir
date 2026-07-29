import { Search, House, Plus, Settings, Trash2, ChevronDown, MoreHorizontal } from 'lucide-react';
import { SidebarItem } from '../SidebarItem';
import { NewPageButton } from '../NewPageButton';
import { PageNode, PageTree } from '../PageTree';

export function Sidebar({ tree }: { tree: PageNode[] }) {
  return (
    <aside className="flex h-full w-full flex-col items-start overflow-clip px-3 pt-3.5 pb-4">
      {' '}
      {/* Workspace switcher */}
      <div className="flex w-full items-center gap-2 overflow-clip px-2 py-1.5">
        <div className="flex size-5.5 shrink-0 items-center justify-center overflow-clip rounded-[11px] bg-accent text-[13px] font-semibold text-ink-inverse">M</div>
        <p className="min-w-0 flex-1 text-sm/5 font-semibold text-ink">Mimir</p>
        <ChevronDown className="size-4 shrink-0 text-ink-secondary" />
        <MoreHorizontal className="size-4 shrink-0 text-ink-secondary" />
      </div>
      {/* Menu */}
      <nav className="flex w-full flex-col items-start gap-px overflow-clip py-2">
        <SidebarItem href="/search" icon={<Search className="size-4" />} label="Search" />
        <SidebarItem href="/" icon={<House className="size-4" />} label="Home" />
      </nav>
      {/* Private pages */}
      <div className="flex w-full flex-col items-start gap-px overflow-clip pt-3">
        <div className="flex w-full items-start overflow-clip px-2 py-1">
          <p className="text-xs/4 font-medium text-ink-tertiary">Private</p>
        </div>
        <PageTree nodes={tree} />
        <NewPageButton className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm/5 font-medium text-ink-secondary transition-colors hover:bg-hover" icon={<Plus className="size-4" />} label="Add a page" />
      </div>
      <div className="min-h-0 w-full flex-1" />
      {/* Footer */}
      <nav className="flex w-full flex-col items-start gap-px overflow-clip">
        <SidebarItem href="/settings" icon={<Settings className="size-4" />} label="Settings" />
        <SidebarItem href="/trash" icon={<Trash2 className="size-4" />} label="Trash" />
      </nav>
    </aside>
  );
}
