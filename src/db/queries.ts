import type { PageNode } from "@/src/components/PageTree";
import { db } from '@/src/db';
import { sql } from "drizzle-orm";

type TreeRow = {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
}

export async function getPageTree(): Promise<PageNode[]> {
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

  const byId = new Map<string, PageNode>();
  for (const row of rows) {
    byId.set(row.id, { id: row.id, title: row.title, icon: row.icon, children: [] });
  }

  const roots: PageNode[] = [];
  for (const row of rows) {
    byId.get(row.id)
    const node = byId.get(row.id)!;
    if (row.parentId) byId.get(row.parentId)!.children!.push(node);
    else roots.push(node);
  }

  return roots;
}