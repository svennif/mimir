'use client';

import { ChevronRight, FileText, Folder } from 'lucide-react';
import { INDENT, ROW_PAD, SidebarItem } from '../SidebarItem';
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
              {(marker === 'before' || marker === 'after') && <div aria-hidden className={`pointer-events-none absolute right-2 z-20 h-0.5 bg-blue-500 ${marker === 'before' ? '-top-px' : '-bottom-px'}`} style={{ left: depth * INDENT + ROW_PAD }} />}

              <SidebarItem
                href={`/pages/${node.id}`}
                pageId={node.id}
                depth={depth}
                label={node.title || 'Untitled'}
                disclosure={
                  hasChildren ? (
                    <button
                      type="button"
                      data-disclosure
                      aria-label={isOpen ? 'Collapse' : 'Expand'}
                      aria-expanded={isOpen}
                      className="flex size-5 cursor-pointer items-center justify-center rounded text-ink-tertiary opacity-0 transition-opacity hover:bg-active group-hover:opacity-100 focus-visible:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        sidebarActions.toggle(node.id);
                      }}>
                      <ChevronRight className={`size-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                  ) : undefined
                }
                icon={node.icon ? <span className="text-sm leading-none">{node.icon}</span> : hasChildren ? <Folder className="size-4" /> : <FileText className="size-4" />}
              />
            </div>

            {hasChildren && isOpen && <PageTree byParent={byParent} parentId={node.id} depth={depth + 1} drag={drag} />}
          </div>
        );
      })}
    </>
  );
}
