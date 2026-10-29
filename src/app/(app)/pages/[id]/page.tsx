import { notFound } from 'next/navigation';
import type { PartialBlock } from '@blocknote/core';
import { DocumentSheet } from '@/src/components/DocumentSheet';
import { db } from '@/src/db';
import { DocumentBody } from '@/src/components/DocumentBody';
import { ChildPages } from '@/src/components/ChildPages';
import { byPosition } from '@/src/lib/tree';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  const page = await db.query.pages.findFirst({
    where: { id, deletedAt: { isNull: true } },
    columns: { title: true },
  });

  return { title: page?.title || 'Untitled' };
}

export default async function PageView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [page, children] = await Promise.all([
    db.query.pages.findFirst({
      where: { id, deletedAt: { isNull: true } },
    }),
    // Sorted below with byPosition, not ORDER BY — see lib/tree.
    db.query.pages.findMany({
      where: { parentId: id, deletedAt: { isNull: true } },
      columns: { id: true, title: true, icon: true, position: true, updatedAt: true },
    }),
  ]);

  if (!page) notFound();

  return (
    <DocumentSheet pageId={page.id} isFavorite={page.favoritePosition !== null}>
      <DocumentBody key={page.id} pageId={page.id} initialContent={page.content as PartialBlock[]} initialVersion={page.version} initialTitle={page.title} initialTextContent={page.textContent} initialUpdatedAt={page.updatedAt} />
      <ChildPages pages={children.sort(byPosition)} />
    </DocumentSheet>
  );
}
