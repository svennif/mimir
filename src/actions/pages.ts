'use server';

import { and, desc, eq, isNull, sql, isNotNull, asc } from 'drizzle-orm';
import { generateKeyBetween } from 'fractional-indexing';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/src/db';
import { pages } from "@/src/db/schema";
import { requireAuth } from '@/src/lib/auth';

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

  const position = generateKeyBetween(lastSibling?.position ?? null, null)
  const [page] = await db
    .insert(pages)
    .values({ parentId, position })
    .returning({ id: pages.id });

  revalidatePath("/", "layout");
  redirect(`/pages/${page.id}`);
}

export async function toggleFavourite(pageId: string) {
  await requireAuth();

  const [page] = await db
    .select({ favoritePosition: pages.favoritePosition })
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1)

  if (!page) throw new Error("Page not found");

  if (page.favoritePosition !== null) {
    await db
      .update(pages)
      .set({ favoritePosition: null })
      .where(eq(pages.id, pageId));
  } else {
    const [firstFav] = await db
      .select({ favoritePosition: pages.favoritePosition })
      .from(pages)
      .where(and(isNotNull(pages.favoritePosition), isNull(pages.deletedAt)))
      .orderBy(asc(pages.favoritePosition))
      .limit(1);

    // null, firstFav → sorts before everything = newest first
    const position = generateKeyBetween(null, firstFav?.favoritePosition ?? null);

    await db
      .update(pages)
      .set({ favoritePosition: position })
      .where(eq(pages.id, pageId));
  }

  revalidatePath("/", "layout");
}

export async function savePage(input: {
  pageId: string;
  content: unknown;
  textContent: string;
  title: string;
  clientVersion: number;
  revalidateTree: boolean;
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

  if (result.length === 0) return { ok: false as const };

  if (input.revalidateTree) revalidatePath("/", "layout");

  return { ok: true as const, version: result[0].version };
}

// Move to trash - Recoverable
export async function trashPage(pageId: string) {
  await requireAuth();

  // Mark the page AND its whole subtree. Children of a trashed page
  // must not keep showing up in the sidebar.
  await db.execute(sql`
      WITH RECURSIVE subtree AS (
        SELECT id FROM pages WHERE id = ${pageId}
        UNION ALL
        SELECT p.id FROM pages p JOIN subtree s ON p.parent_id = s.id
      )
      UPDATE pages
      SET deleted_at = now()
      WHERE id IN (SELECT id FROM subtree) AND deleted_at IS NULL
    `);
  revalidatePath('/', 'layout');
  redirect('/');
}

// Restore page from Trash view
export async function restorePage(pageId: string) {
  await requireAuth();

  await db.execute(sql`
    WITH RECURSIVE subtree AS (
      SELECT id FROM pages WHERE id = ${pageId}
      UNION ALL
      SELECT p.id FROM pages p JOIN subtree s ON p.parent_id = s.id
    )
    UPDATE pages SET deleted_at = NULL WHERE id IN (SELECT id FROM subtree)
  `);

  revalidatePath("/", "layout");
}

// Permanently delete - Trash view only
export async function deletePage(pageId: string) {
  await requireAuth();

  await db.delete(pages).where(eq(pages.id, pageId));
}