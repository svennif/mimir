'use server';

import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { generateKeyBetween } from 'fractional-indexing';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/src/db';
import { pages } from "@/src/db/schema";

export async function createPage(parentId: string | null = null) {
  // TODO: authoritative auth check goes here once jose is wired:
  // const { loggedIn } = await getSession();
  // if (!loggedIn) throw new Error("Unauthorized");

  // Find the last sibling so we can append after it

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

export async function SavePage(
  pageId: string,
  content: unknown,
  textContent: string,
  clientVersion: number,
) {
  const result = await db
    .update(pages)
    .set({
      content,
      textContent,
      updatedAt: new Date(),
      version: sql`${pages.version} + 1`,
    })
    .where(and(eq(pages.id, pageId), eq(pages.version, clientVersion)))
    .returning({ version: pages.version });

  if (result.length === 0) {
    return { conflict: true as const };
  }

  return { conflict: false as const, version: result[0].version };
}