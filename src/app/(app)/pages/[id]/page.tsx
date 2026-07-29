import { notFound } from 'next/navigation';
import type { PartialBlock } from '@blocknote/core';
import { DocumentSheet } from '@/src/components/DocumentSheet';
import { db } from '@/src/db';
import { DocumentBody } from '@/src/components/DocumentBody';

export default async function PageView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const page = await db.query.pages.findFirst({
    where: { id, deletedAt: { isNull: true } },
  });

  if (!page) notFound();

  return (
    <DocumentSheet isFavorite={page.favoritePosition !== null}>
      <DocumentBody key={page.id} pageId={page.id} initialContent={page.content as PartialBlock[]} initialVersion={page.version} initialTitle={page.title} initialTextContent={page.textContent} initialUpdatedAt={page.updatedAt} />
    </DocumentSheet>
  );
}
