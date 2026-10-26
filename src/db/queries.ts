import { db } from '@/src/db';
import { eq, sql } from "drizzle-orm";
import { settings } from '@/src/db/schema';
import { DISPLAY_NAME_KEY } from '@/src/lib/settings';

/** The name set on the Settings page, or null if there isn't one. */
export async function getDisplayName(): Promise<string | null> {
  const [row] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, DISPLAY_NAME_KEY))
    .limit(1);

  // jsonb comes back as unknown — only trust a non-empty string.
  return typeof row?.value === 'string' && row.value ? row.value : null;
}

type TreeRow = {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
}

// Nested, unlike lib/tree's flat PageNode — hence its own type rather than an
// import. Nothing calls this: the sidebar reads the adjacency list straight
// from (app)/layout.tsx.
type TreeNode = {
  id: string;
  title: string;
  icon: string | null;
  children: TreeNode[];
}

export async function getPageTree(): Promise<TreeNode[]> {
  const rows = (await db.execute(sql`
  WITH RECURSIVE tree AS (
    SELECT id, title, icon, parent_id, position, 0 AS depth
    FROM pages
    WHERE parent_id IS NULL AND deleted_at IS NULL

    UNION ALL

    SELECT p.id, p.title, p.icon, p.parent_id, p.position, t.depth + 1
    FROM pages p
    JOIN tree t ON p.parent_id = t.id
    WHERE p.deleted_at IS NULL AND t.depth < 20
  )
  SELECT id, title, icon, parent_id AS "parentId"
  FROM tree
  ORDER BY depth, position
`)) as unknown as TreeRow[];

  const byId = new Map<string, TreeNode>();
  for (const row of rows) {
    byId.set(row.id, { id: row.id, title: row.title, icon: row.icon, children: [] });
  }

  const roots: TreeNode[] = [];
  for (const row of rows) {
    const node = byId.get(row.id)!;
    if (row.parentId) byId.get(row.parentId)!.children.push(node);
    else roots.push(node);
  }

  return roots;
}
