'use server';

import { and, asc, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { generateKeyBetween } from 'fractional-indexing';
import { revalidatePath } from 'next/cache';
import { db } from '@/src/db';
import { pages } from '@/src/db/schema';
import { requireAuth } from '@/src/lib/auth';

// Exactly the shape the sidebar store holds. If you add a field to PageNode,
// add it here and in /api/pages/tree too.
const nodeColumns = {
  id: pages.id,
  parentId: pages.parentId,
  title: pages.title,
  icon: pages.icon,
  position: pages.position,
};

export async function createPage(parentId: string | null = null) {
  await requireAuth();

  const [lastSibling] = await db
    .select({ position: pages.position })
    .from(pages)
    .where(
      and(
        parentId === null ? isNull(pages.parentId) : eq(pages.parentId, parentId),
        isNull(pages.deletedAt),
      ),
    )
    .orderBy(desc(pages.position))
    .limit(1);

  const [page] = await db
    .insert(pages)
    .values({
      parentId,
      position: generateKeyBetween(lastSibling?.position ?? null, null),
    })
    .returning(nodeColumns);

  // No revalidatePath, no redirect — the caller patches the store and navigates.
  return { ok: true as const, page };
}

export async function renamePage(pageId: string, title: string) {
  await requireAuth();

  const [row] = await db
    .update(pages)
    .set({ title: title.slice(0, 200), updatedAt: new Date() })
    .where(and(eq(pages.id, pageId), isNull(pages.deletedAt)))
    .returning({ id: pages.id, title: pages.title });

  if (!row) return { ok: false as const, error: 'NOT_FOUND' };
  return { ok: true as const, page: row };
}

export async function toggleFavourite(pageId: string) {
  await requireAuth();

  // Read-then-write needs a transaction and a row lock, or two fast clicks
  // lose a toggle.
  return db.transaction(async (tx) => {
    const [page] = await tx
      .select({ favoritePosition: pages.favoritePosition })
      .from(pages)
      .where(eq(pages.id, pageId))
      .for('update')
      .limit(1);

    if (!page) return { ok: false as const, error: 'NOT_FOUND' };

    if (page.favoritePosition !== null) {
      await tx
        .update(pages)
        .set({ favoritePosition: null })
        .where(eq(pages.id, pageId));

      return { ok: true as const, favoritePosition: null };
    }

    const [firstFav] = await tx
      .select({ favoritePosition: pages.favoritePosition })
      .from(pages)
      .where(and(isNotNull(pages.favoritePosition), isNull(pages.deletedAt)))
      .orderBy(asc(pages.favoritePosition))
      .limit(1);

    // Sorts before everything = newest first.
    const favoritePosition = generateKeyBetween(null, firstFav?.favoritePosition ?? null);

    await tx
      .update(pages)
      .set({ favoritePosition })
      .where(eq(pages.id, pageId));

    return { ok: true as const, favoritePosition };
  });
}

export async function savePage(input: {
  pageId: string;
  content: unknown;
  textContent: string;
  title: string;
  clientVersion: number;
}) {
  await requireAuth();

  const result = await db
    .update(pages)
    .set({
      content: input.content,
      textContent: input.textContent,
      title: input.title,
      updatedAt: new Date(),
      version: sql`${pages.version} + 1`,
    })
    .where(and(eq(pages.id, input.pageId), eq(pages.version, input.clientVersion)))
    .returning({ version: pages.version });

  // Version mismatch = another tab wrote first. The client decides what to do.
  if (result.length === 0) return { ok: false as const, error: 'STALE' };

  // No revalidate — the editor calls sidebarActions.setTitle directly.
  return { ok: true as const, version: result[0].version };
}

// Move to trash — recoverable.
export async function trashPage(pageId: string) {
  await requireAuth();

  // One timestamp per operation; restore matches on it so a child trashed
  // separately earlier doesn't come back with its parent. Not now() — that's
  // transaction time and identical across statements.
  const deletedAt = new Date();

  const removed = await db.execute<{ id: string }>(sql`
    WITH RECURSIVE subtree AS (
      SELECT id FROM pages WHERE id = ${pageId}
      UNION ALL
      SELECT p.id FROM pages p JOIN subtree s ON p.parent_id = s.id
    )
    UPDATE pages SET deleted_at = ${deletedAt}
    WHERE id IN (SELECT id FROM subtree) AND deleted_at IS NULL
    RETURNING id
  `);

  // The trash view is server-rendered and nothing on the client mirrors it.
  revalidatePath('/trash');

  return { ok: true as const, ids: removed.map((r) => r.id), deletedAt };
}

export async function restorePage(pageId: string) {
  await requireAuth();

  const result = await db.transaction(async (tx) => {
    const [root] = await tx
      .select({ deletedAt: pages.deletedAt, parentId: pages.parentId })
      .from(pages)
      .where(eq(pages.id, pageId))
      .for('update')
      .limit(1);

    if (!root) return { ok: false as const, error: 'NOT_FOUND' };
    if (!root.deletedAt) return { ok: false as const, error: 'NOT_TRASHED' };

    // Parent still trashed → restoring in place makes the page invisible.
    let reparent = false;
    if (root.parentId) {
      const [parent] = await tx
        .select({ deletedAt: pages.deletedAt })
        .from(pages)
        .where(eq(pages.id, root.parentId))
        .limit(1);

      reparent = !parent || parent.deletedAt !== null;
    }

    // Only rows trashed in the *same* operation come back.
    await tx.execute(sql`
      WITH RECURSIVE subtree AS (
        SELECT id FROM pages WHERE id = ${pageId}
        UNION ALL
        SELECT p.id FROM pages p JOIN subtree s ON p.parent_id = s.id
      )
      UPDATE pages SET deleted_at = NULL
      WHERE id IN (SELECT id FROM subtree) AND deleted_at = ${root.deletedAt}
    `);

    if (reparent) {
      const [lastRoot] = await tx
        .select({ position: pages.position })
        .from(pages)
        .where(and(isNull(pages.parentId), isNull(pages.deletedAt)))
        .orderBy(desc(pages.position))
        .limit(1);

      await tx
        .update(pages)
        .set({
          parentId: null,
          position: generateKeyBetween(lastRoot?.position ?? null, null),
        })
        .where(eq(pages.id, pageId));
    }

    // Return the restored rows so the sidebar splices them back in.
    const restored = await tx.execute<{
      id: string;
      parent_id: string | null;
      title: string;
      icon: string | null;
      position: string;
    }>(sql`
      WITH RECURSIVE subtree AS (
        SELECT id FROM pages WHERE id = ${pageId}
        UNION ALL
        SELECT p.id FROM pages p JOIN subtree s ON p.parent_id = s.id
      )
      SELECT id, parent_id, title, icon, position
      FROM pages
      WHERE id IN (SELECT id FROM subtree) AND deleted_at IS NULL
    `);

    return {
      ok: true as const,
      nodes: restored.map((r) => ({
        id: r.id,
        parentId: r.parent_id,
        title: r.title,
        icon: r.icon,
        position: r.position,
      })),
    };
  });

  revalidatePath('/trash');
  return result;
}

// Permanently delete — trash view only.
export async function deletePage(pageId: string) {
  await requireAuth();

  // Relies on the FK being ON DELETE CASCADE. If it's `no action`, this leaves
  // orphans: rows whose parent_id points at nothing, invisible to any query
  // that starts from roots. Check your schema.
  const [row] = await db
    .delete(pages)
    .where(and(eq(pages.id, pageId), isNotNull(pages.deletedAt)))
    .returning({ id: pages.id });

  if (!row) return { ok: false as const, error: 'NOT_TRASHED' };

  revalidatePath('/trash');
  return { ok: true as const, id: row.id };
}

// Move page: reparent and/or reorder among siblings.
// afterId = the sibling to land *after*. null = first position.
export async function movePage(input: {
  pageId: string;
  parentId: string | null;
  afterId?: string | null;
}) {
  await requireAuth();

  const { pageId, parentId, afterId = null } = input;
  if (pageId === parentId) return { ok: false as const, error: 'SELF_PARENT' };
  if (afterId === pageId) return { ok: false as const, error: 'SELF_ANCHOR' };

  const result = await db.transaction(async (tx) => {
    const [page] = await tx
      .select({ id: pages.id })
      .from(pages)
      .where(and(eq(pages.id, pageId), isNull(pages.deletedAt)))
      .for('update');

    if (!page) return { ok: false as const, error: 'NOT_FOUND' };

    // Both checks belong in this branch — a null parent means "move to root",
    // where there's no target to validate and no cycle possible.
    if (parentId !== null) {
      const [parent] = await tx
        .select({ id: pages.id })
        .from(pages)
        .where(and(eq(pages.id, parentId), isNull(pages.deletedAt)))
        .limit(1);

      if (!parent) return { ok: false as const, error: 'PARENT_NOT_FOUND' };

      // Walk up from the target. Hitting ourselves means this drop would orphan
      // the subtree — unreachable from any root, permanently.
      const cycle = await tx.execute(sql`
        WITH RECURSIVE ancestors AS (
          SELECT id, parent_id FROM pages WHERE id = ${parentId}
          UNION ALL
          SELECT p.id, p.parent_id
          FROM pages p
          JOIN ancestors a ON p.id = a.parent_id
        )
        SELECT 1 FROM ancestors WHERE id = ${pageId} LIMIT 1
      `);

      // postgres-js returns the rows array directly, not { rows }.
      if (cycle.length > 0) return { ok: false as const, error: 'CYCLE' };
    }

    const sameParent =
      parentId === null ? isNull(pages.parentId) : eq(pages.parentId, parentId);

    let prevPosition: string | null = null;
    if (afterId !== null) {
      const [anchor] = await tx
        .select({ position: pages.position, parentId: pages.parentId })
        .from(pages)
        .where(and(eq(pages.id, afterId), isNull(pages.deletedAt)))
        .limit(1);

      // The client's tree snapshot may be seconds old.
      if (!anchor || anchor.parentId !== parentId) {
        return { ok: false as const, error: 'STALE_ANCHOR' };
      }

      prevPosition = anchor.position;
    }

    const [nextSibling] = await tx
      .select({ position: pages.position })
      .from(pages)
      .where(
        and(
          sameParent,
          isNull(pages.deletedAt),
          // Exclude self, or reordering within the same parent finds its own
          // current position as "next" and the page never moves.
          sql`${pages.id} <> ${pageId}`,
          prevPosition === null ? undefined : sql`${pages.position} > ${prevPosition}`,
        ),
      )
      .orderBy(asc(pages.position))
      .limit(1);

    const position = generateKeyBetween(prevPosition, nextSibling?.position ?? null);

    await tx
      .update(pages)
      .set({ parentId, position, updatedAt: new Date() })
      .where(eq(pages.id, pageId));

    // No revalidatePath — the client already applied this optimistically, and
    // a layout revalidation would remount BlockNote and drop the cursor.
    return { ok: true as const, position };
  });

  if (result.ok) revalidatePath('/', 'layout');
  return result;
}