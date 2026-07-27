'use server';

import { and, desc, eq, isNull } from 'drizzle-orm';
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