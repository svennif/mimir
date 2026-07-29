import { notFound } from 'next/navigation';
import type { PartialBlock } from '@blocknote/core';
import { DocumentSheet } from '@/src/components/DocumentSheet';
import { db } from '@/src/db';
import { Editor } from '@/src/components/Editor';

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function relativeTime(date: Date) {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (seconds < 3600) return rtf.format(-Math.round(seconds / 60), 'minute');
  if (seconds < 86400) return rtf.format(-Math.round(seconds / 3600), 'hour');
  return rtf.format(-Math.round(seconds / 86400), 'day');
}

export default async function PageView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const page = await db.query.pages.findFirst({
    where: { id, deletedAt: { isNull: true } },
  });

  if (!page) notFound();

  return (
    <DocumentSheet isFavorite={page.favoritePosition !== null}>
      <div className="flex w-full flex-col items-start overflow-clip pb-3">
        <p className="text-sm/5 text-ink-tertiary">{`Edited ${relativeTime(page.updatedAt)}  ·  ${wordCount(page.textContent)} words  ·  Private`}</p>
      </div>

      <Editor key={page.id} pageId={page.id} initialContent={page.content as PartialBlock[]} initialVersion={page.version} initialTitle={page.title} />
    </DocumentSheet>
  );
}
