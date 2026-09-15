'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useOptimistic, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { movePage } from '@/src/actions/pages';
import { sidebarActions, sidebarStore } from '@/src/stores/sidebar';
import { descendantIds, indexByParent, childrenOf, type PageNode } from '@/src/lib/tree';
import { intentToTarget, isNoop, positionForTarget, resolveIntent, type Intent } from '@/src/lib/drop-intent';
import { PageTree, type DragApi, type RowMeta } from '../PageTree';

const ERRORS: Record<string, string> = {
  CYCLE: "Can't move a page into itself",
  SELF_PARENT: "Can't move a page into itself",
  SELF_ANCHOR: "Can't move a page next to itself",
  PARENT_NOT_FOUND: 'That page no longer exists',
  NOT_FOUND: 'That page no longer exists',
  STALE_ANCHOR: 'Sidebar was out of date',
  CONFLICT: 'Another change landed first — try again',
};

const SPRING_MS = 500;
const SCROLL_EDGE = 56;
const EMPTY: ReadonlySet<string> = new Set();

type Move = { id: string; parentId: string | null; position: string };

export function SidebarTree({ nodes }: { nodes: PageNode[] }) {
  const router = useRouter();

  const [optimisticNodes, applyOptimistic] = useOptimistic(nodes, (state: PageNode[], move: Move) => state.map((n) => (n.id === move.id ? { ...n, parentId: move.parentId, position: move.position } : n)));
  const byParent = useMemo(() => indexByParent(optimisticNodes), [optimisticNodes]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [overRoot, setOverRoot] = useState(false);
  const [blocked, setBlocked] = useState<ReadonlySet<string>>(EMPTY);

  // dragover fires ~60Hz per row. Read synchronously in handlers; only a
  // *changed* intent is mirrored into state.
  const activeRef = useRef<string | null>(null);
  const intentRef = useRef<Intent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pushIntent = useCallback((next: Intent | null) => {
    const prev = intentRef.current;
    const prevAt = prev?.kind === 'inside' ? prev.at : undefined;
    const nextAt = next?.kind === 'inside' ? next.at : undefined;
    if (prev?.id === next?.id && prev?.kind === next?.kind && prevAt === nextAt) return;
    intentRef.current = next;
    setIntent(next);
  }, []);

  const resetDrag = useCallback(() => {
    activeRef.current = null;
    intentRef.current = null;
    setBlocked(EMPTY);
    setIntent(null);
    setActiveId(null);
    setOverRoot(false);
  }, []);

  const handleDragStart = useCallback(
    (id: string) => {
      activeRef.current = id;
      setBlocked(new Set([id, ...descendantIds(optimisticNodes, id)]));
      setActiveId(id);
    },
    [optimisticNodes]
  );

  // Rows stopPropagation on dragover (they nest), so the scroll container never
  // sees the event. Autoscroll has to be driven from the row handler instead.
  const autoScroll = useCallback((clientY: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const delta = clientY < box.top + SCROLL_EDGE ? -10 : clientY > box.bottom - SCROLL_EDGE ? 10 : 0;
    if (delta !== 0) el.scrollTop += delta;
  }, []);

  const handleRowOver = useCallback(
    (id: string, rect: DOMRect, clientY: number, meta: RowMeta) => {
      if (!activeRef.current) return;
      autoScroll(clientY);
      setOverRoot(false);
      pushIntent(resolveIntent({ id, ...meta }, rect, clientY));
    },
    [autoScroll, pushIntent]
  );

  const commit = useCallback(() => {
    const movingId = activeRef.current;
    const current = intentRef.current;
    const wasOverRoot = overRoot;
    resetDrag();
    if (!movingId) return;

    const snapshot = optimisticNodes;
    let target: { parentId: string | null; afterId: string | null } | null = null;

    if (current) {
      target = intentToTarget(snapshot, movingId, current);
    } else if (wasOverRoot) {
      const roots = childrenOf(byParent, null).filter((n) => n.id !== movingId);
      target = { parentId: null, afterId: roots.at(-1)?.id ?? null };
    }

    if (!target || isNoop(snapshot, movingId, target)) return;
    const move = target;

    startTransition(async () => {
      applyOptimistic({
        id: movingId,
        parentId: move.parentId,
        position: positionForTarget(snapshot, movingId, move),
      });

      const res = await movePage({ pageId: movingId, ...move });

      // On failure React drops the optimistic entry when the transition ends
      // and re-renders from props — no manual rollback needed.
      if (!res.ok) {
        if (res.error === 'STALE_ANCHOR') router.refresh();
        console.warn(ERRORS[res.error] ?? 'Move failed');
      }
    });
  }, [optimisticNodes, byParent, overRoot, resetDrag, applyOptimistic, router]);

  // Spring-loaded folders: hover a closed page for half a second and it opens,
  // so you can drag several levels deep in one gesture.
  useEffect(() => {
    if (intent?.kind !== 'inside') return;
    if (sidebarStore.getState().expanded.has(intent.id)) return;
    if (childrenOf(indexByParent(optimisticNodes), intent.id).length === 0) return;

    const timer = setTimeout(() => sidebarActions.expand(intent.id), SPRING_MS);
    return () => clearTimeout(timer);
  }, [intent, optimisticNodes]);

  // Self-healing resync: covers a second tab or a change we didn't originate.
  useEffect(() => {
    const resync = () => {
      if (document.visibilityState !== 'visible') return;
      if (activeRef.current) return; // never stomp an in-flight drag
      router.refresh();
    };
    document.addEventListener('visibilitychange', resync);
    return () => document.removeEventListener('visibilitychange', resync);
  }, [router]);

  const drag: DragApi = {
    activeId,
    blocked,
    intent,
    onDragStart: handleDragStart,
    onRowOver: handleRowOver,
    onDrop: commit,
    onDragEnd: resetDrag,
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-start gap-px overflow-clip pt-3">
      <PageTree byParent={byParent} drag={drag} />
      <div
        className={`mt-1 min-h-12 flex-1 rounded transition-colors ${overRoot ? 'bg-blue-500/10 ring-1 ring-inset ring-blue-500' : ''}`}
        onDragOver={(e) => {
          if (!activeRef.current) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          autoScroll(e.clientY);
          pushIntent(null);
          setOverRoot(true);
        }}
        onDragLeave={() => setOverRoot(false)}
        onDrop={(e) => {
          e.preventDefault();
          commit();
        }}
      />
    </div>
  );
}
