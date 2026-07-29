'use client';

import dynamic from 'next/dynamic';
import type { PartialBlock } from '@blocknote/core';

const BlockNoteEditor = dynamic(() => import('./BlockNoteEditor'), {
  ssr: false,
  loading: () => <div className="text-sm text-ink-tertiary">Loading editor…</div>,
});

export function Editor({ pageId, initialContent, initialVersion, initialTitle }: { pageId: string; initialContent?: PartialBlock[]; initialVersion: number; initialTitle: string }) {
  return <BlockNoteEditor pageId={pageId} initialContent={initialContent} initialVersion={initialVersion} initialTitle={initialTitle} />;
}
