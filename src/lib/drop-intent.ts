import { generateKeyBetween } from 'fractional-indexing';
import { childrenOf, indexByParent, type PageNode } from './tree';

export type Intent =
  | { kind: 'before'; id: string }
  | { kind: 'after'; id: string }
  | { kind: 'inside'; id: string; at: 'start' | 'end' };

/**
 * Top 25%  → land before this row (sibling)
 * Bottom 25% → after it, or as its first child when it's open
 * Middle 50% → inside it, appended. This is the drop-on-top-to-nest gesture.
 */
export function resolveIntent(
  row: { id: string; expanded: boolean; hasChildren: boolean },
  rect: { top: number; height: number },
  pointerY: number,
): Intent {
  const ratio = (pointerY - rect.top) / rect.height;
  if (ratio < 0.25) return { kind: 'before', id: row.id };
  if (ratio > 0.75) {
    return row.expanded && row.hasChildren
      ? { kind: 'inside', id: row.id, at: 'start' }
      : { kind: 'after', id: row.id };
  }
  return { kind: 'inside', id: row.id, at: 'end' };
}

export type MoveTarget = { parentId: string | null; afterId: string | null };

/**
 * Turn an intent into what the server wants. The moving page is excluded from
 * the sibling list first — otherwise dropping a page just below its own current
 * slot resolves `afterId` to itself and the action bails with SELF_ANCHOR.
 */
export function intentToTarget(
  nodes: PageNode[],
  movingId: string,
  intent: Intent,
): MoveTarget | null {
  const map = indexByParent(nodes);
  const target = nodes.find((n) => n.id === intent.id);
  if (!target) return null;

  if (intent.kind === 'inside') {
    const kids = childrenOf(map, target.id).filter((k) => k.id !== movingId);
    return {
      parentId: target.id,
      afterId: intent.at === 'start' ? null : (kids.at(-1)?.id ?? null),
    };
  }

  const siblings = childrenOf(map, target.parentId).filter((s) => s.id !== movingId);
  const index = siblings.findIndex((s) => s.id === target.id);

  return {
    parentId: target.parentId,
    afterId: intent.kind === 'after' ? target.id : (siblings[index - 1]?.id ?? null),
  };
}

/** Same neighbour maths the server does, so the optimistic row lands correctly. */
export function positionForTarget(
  nodes: PageNode[],
  movingId: string,
  target: MoveTarget,
): string {
  const map = indexByParent(nodes);
  const siblings = childrenOf(map, target.parentId).filter((s) => s.id !== movingId);
  const anchorIndex = target.afterId
    ? siblings.findIndex((s) => s.id === target.afterId)
    : -1;

  const prev = anchorIndex >= 0 ? siblings[anchorIndex].position : null;
  const next = siblings[anchorIndex + 1]?.position ?? null;
  return generateKeyBetween(prev, next);
}

/** The drop is a no-op if the page already sits exactly there. */
export function isNoop(nodes: PageNode[], movingId: string, target: MoveTarget) {
  const moving = nodes.find((n) => n.id === movingId);
  if (!moving || moving.parentId !== target.parentId) return false;

  const map = indexByParent(nodes);
  const siblings = childrenOf(map, target.parentId);
  const currentIndex = siblings.findIndex((s) => s.id === movingId);
  const anchorIndex = target.afterId
    ? siblings.findIndex((s) => s.id === target.afterId)
    : -1;

  return currentIndex === anchorIndex + 1;
}