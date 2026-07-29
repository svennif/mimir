'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { en } from '@blocknote/core/locales';
import type { Theme } from '@blocknote/mantine';
import type { PartialBlock } from '@blocknote/core';
import '@blocknote/mantine/style.css';
import './editor.css';
import { useAutosave } from '@/src/hooks/use-autosave';

const theme: Theme = {
  colors: {
    editor: { text: '#3f3f3b', background: 'transparent' },
    menu: { text: '#3f3f3b', background: '#ffffff' },
    tooltip: { text: '#3f3f3b', background: '#ffffff' },
    hovered: { text: '#3f3f3b', background: 'rgba(60,60,55,0.05)' },
    selected: { text: '#3f3f3b', background: 'rgba(124,158,143,0.16)' },
    disabled: { text: '#adada5', background: '#f3f3ef' },
    shadow: '#ebebe6',
    border: '#ebebe6',
    sideMenu: '#adada5',
  },
  borderRadius: 12,
  fontFamily: 'var(--font-jakarta), sans-serif',
};

export default function BlockNoteEditor({ pageId, initialContent, initialVersion, initialTitle }: { pageId: string; initialContent?: PartialBlock[]; initialVersion: number; initialTitle: string }) {
  const { schedule, status } = useAutosave(pageId, initialVersion, initialTitle);

  const editor = useCreateBlockNote({
    initialContent: initialContent?.length ? initialContent : [{ type: 'heading', props: { level: 1 } }],
    dictionary: {
      ...en,
      placeholders: { ...en.placeholders, heading: 'Untitled' },
    },
  });

  return (
    <>
      {status === 'conflict' && (
        <div className="mb-4 w-full rounded-md border border-line bg-active px-4 py-3 text-sm text-ink">
          This page changed elsewhere. Reload to get the newer version, or overwrite it.
          <button onClick={() => window.location.reload()} className="ml-3 underline">
            Reload
          </button>
        </div>
      )}
      <BlockNoteView editor={editor} theme={theme} className="w-full" onChange={() => schedule(editor.document)} />
      <span className="mt-2 text-xs text-ink-tertiary">
        {status === 'saving' && 'Saving…'}
        {status === 'saved' && 'Saved'}
        {status === 'error' && <span className="text-red-600">Save failed — see console</span>}
      </span>
    </>
  );
}
