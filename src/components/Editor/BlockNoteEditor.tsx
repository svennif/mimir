'use client';

import { BlockNoteContext, useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import type { Theme } from '@blocknote/mantine';
import type { PartialBlock, Block } from '@blocknote/core';
import { useResolvedTheme } from '@/src/stores/theme';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/src/lib/files';
import '@blocknote/mantine/style.css';
import './editor.css';

// BlockNote writes these onto the editor's root as inline custom properties, so
// pointing them at our own tokens is enough — one theme, and it follows the
// palette without a dark twin.
const theme: Theme = {
  colors: {
    editor: { text: 'var(--text-primary)', background: 'transparent' },
    menu: { text: 'var(--text-primary)', background: 'var(--bg-tooltip)' },
    tooltip: { text: 'var(--text-primary)', background: 'var(--bg-tooltip)' },
    hovered: { text: 'var(--text-primary)', background: 'var(--bg-hover)' },
    selected: { text: 'var(--text-primary)', background: 'var(--bg-active)' },
    disabled: { text: 'var(--text-tertiary)', background: 'var(--bg-code)' },
    shadow: 'var(--border-default)',
    border: 'var(--border-default)',
    sideMenu: 'var(--text-tertiary)',
  },
  borderRadius: 12,
  fontFamily: 'var(--font-jakarta), sans-serif',
};

// Setting `uploadFile` is all it takes for BlockNote to accept pasted and dropped
// images and to show an "Upload" tab in the image block. Without it, BlockNote
// assumes the app can't store files and offers only "Embed" (a URL).
// Throwing is the failure path: BlockNote leaves an empty image block (which can be
// retried) on paste, and shows an error in the Upload tab.
async function uploadFile(pageId: string, file: File): Promise<string> {
  // Checked again on the server; checking here skips a pointless upload.
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error(`Unsupported file type: ${file.type}`);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('File too large');

  const body = new FormData();
  body.append('file', file);
  body.append('pageId', pageId);

  const res = await fetch('/api/files', { method: 'POST', body });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);

  const { url } = (await res.json()) as { url: string };
  return url;
}

export default function BlockNoteEditor({ pageId, initialContent, onDocumentChange }: { pageId: string; initialContent?: PartialBlock[]; onDocumentChange: (blocks: Block[]) => void }) {
  const editor = useCreateBlockNote({
    initialContent: initialContent?.length ? initialContent : [{ type: 'heading', props: { level: 1 } }],
    uploadFile: (file) => uploadFile(pageId, file),
  });
  const resolved = useResolvedTheme();

  return (
    // Given an object `theme`, BlockNote falls back to prefers-color-scheme for
    // its own light/dark class — which is wrong the moment the user overrides
    // the OS. This context is the only way to tell it which one we settled on.
    <BlockNoteContext.Provider value={{ colorSchemePreference: resolved }}>
      <BlockNoteView editor={editor} theme={theme} className="w-full" onChange={() => onDocumentChange(editor.document)} />
    </BlockNoteContext.Provider>
  );
}
