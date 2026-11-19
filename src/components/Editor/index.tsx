'use client';

import dynamic from 'next/dynamic';
import type { Block, PartialBlock } from '@blocknote/core';

const BlockNoteEditor = dynamic(() => import('./BlockNoteEditor'), {
  ssr: false,
  loading: () => <div className="text-sm text-ink-tertiary">Loading editor…</div>,
});

export function Editor({ pageId, initialContent, onDocumentChange }: { pageId: string; initialContent?: PartialBlock[]; onDocumentChange: (blocks: Block[]) => void }) {
  return <BlockNoteEditor pageId={pageId} initialContent={initialContent} onDocumentChange={onDocumentChange} />;
}
