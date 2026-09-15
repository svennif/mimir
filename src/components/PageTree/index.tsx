'use client';

import { ChevronRight, FileText, Folder } from 'lucide-react';
import { SidebarItem } from '../SidebarItem';
import { sidebarActions, sidebarStore } from '@/src/stores/sidebar';
import { childrenOf, indexByParent } from '@/src/lib/tree';
import type { Intent } from '@/src/lib/drop-intent';

export type RowMeta = { expanded: boolean; hasChildren: boolean };

export type DragApi = {
  activeId: string | null;
  blocked: ReadonlySet<string>;
  intent: Intent | null;
  onDragStart: (id: string) => void;
  onRowOver: (id: string, rect: DOMRect, clientY: number, meta: RowMeta) => void;
  onDrop: () => void;
  onDragEnd: () => void;
};
export function PageTree({ byParent, parentId = null, depth = 0, drag }: { byParent: ReturnType<typeof indexByParent>; parentId?: string | null; depth?: number; drag: DragApi }) {
  const expanded = sidebarStore((s) => s.expanded);
  const rows = childrenOf(byParent, parentId);

  return (
    <>
      {rows.map((node) => {
        // Hide the dragged page's descendants: if they stay, the list reflows
        // under the cursor and you can hover your own children.
        if (drag.activeId && node.id !== drag.activeId && drag.blocked.has(node.id)) {
          return null;
        }

        const hasChildren = childrenOf(byParent, node.id).length > 0;
        const isOpen = expanded.has(node.id);
        const isDragging = drag.activeId === node.id;
        const blocked = drag.blocked.has(node.id);
        const marker = drag.intent?.id === node.id ? drag.intent.kind : null;
        return (
          <div key={node.id} className="w-full">
            <div
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', node.id);
                e.dataTransfer.effectAllowed = 'move';
                drag.onDragStart(node.id);
              }}
              onDragOver={(e) => {
                if (blocked) return;
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
                drag.onRowOver(node.id, e.currentTarget.getBoundingClientRect(), e.clientY, {
                  expanded: isOpen,
                  hasChildren,
                });
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                drag.onDrop();
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                drag.onDragEnd();
              }}
              className={`relative rounded ${isDragging ? 'opacity-40' : ''} ${marker === 'inside' ? 'bg-blue-500/10 ring-1 ring-inset ring-blue-500' : ''}`}>
              {(marker === 'before' || marker === 'after') && <div aria-hidden className={`pointer-events-none absolute right-2 z-20 h-0.5 bg-blue-500 ${marker === 'before' ? '-top-px' : '-bottom-px'}`} style={{ left: depth * 14 + 8 }} />}

              {hasChildren && (
                <button
                  type="button"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                  className="absolute top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-neutral-500 hover:bg-neutral-200"
                  style={{ left: depth * 14 + 2 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    sidebarActions.toggle(node.id);
                  }}>
                  <ChevronRight className={`size-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
              )}

              <SidebarItem href={`/pages/${node.id}`} pageId={node.id} depth={depth} label={node.title || 'Untitled'} icon={node.icon ? <span className="text-sm leading-none">{node.icon}</span> : hasChildren ? <Folder className="size-4" /> : <FileText className="size-4" />} />
            </div>

            {hasChildren && isOpen && <PageTree byParent={byParent} parentId={node.id} depth={depth + 1} drag={drag} />}
          </div>
        );
      })}
    </>
  );
}
