export type PageNode = {
  id: string;
  parentId: string | null;
  title: string;
  icon: string | null;
  position: string;
}

export type FlatRow = PageNode & {
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

// Fractional indexes compare by code point ('B' < 'a'). Sort with this rather
// than SQL ORDER BY, whose locale collation can disagree.
export function byPosition(a: { position: string }, b: { position: string }) {
  return a.position < b.position ? -1 : a.position > b.position ? 1 : 0;
}

export function indexByParent(nodes: PageNode[]) {
  const map = new Map<string, PageNode[]>();
  for (const n of nodes) {
    const key = n.parentId ?? '';
    const list = map.get(key);
    if (list) list.push(n);
    else map.set(key, [n]);
  }
  for (const list of map.values()) {
    list.sort(byPosition);
  }
  return map;
}

export function childrenOf(map: Map<string, PageNode[]>, parentId: string | null) {
  return map.get(parentId ?? '') ?? [];
}

export function flatten(
  nodes: PageNode[],
  expanded: Set<string>,
  hide?: Set<string>,
): FlatRow[] {
  const map = indexByParent(nodes);
  const out: FlatRow[] = [];

  const walk = (parentId: string | null, depth: number) => {
    for (const node of childrenOf(map, parentId)) {
      if (hide?.has(node.id)) continue;
      const kids = childrenOf(map, node.id);
      const isOpen = expanded.has(node.id);
      out.push({ ...node, depth, hasChildren: kids.length > 0, expanded: isOpen });
      if (isOpen) walk(node.id, depth + 1);
    }
  };

  walk(null, 0);
  return out;
}

export function descendantIds(nodes: PageNode[], rootId: string): string[] {
  const map = indexByParent(nodes);
  const out: string[] = [];
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    for (const child of childrenOf(map, id)) {
      out.push(child.id);
      stack.push(child.id);
    }
  }
  return out;
}