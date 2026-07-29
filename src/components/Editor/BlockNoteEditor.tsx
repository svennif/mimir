'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import type { Theme } from '@blocknote/mantine';
import type { PartialBlock, Block } from '@blocknote/core';
import '@blocknote/mantine/style.css';
import './editor.css';

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

export default function BlockNoteEditor({ initialContent, onDocumentChange }: { initialContent?: PartialBlock[]; onDocumentChange: (blocks: Block[]) => void }) {
  const editor = useCreateBlockNote({
    initialContent: initialContent?.length ? initialContent : [{ type: 'heading', props: { level: 1 } }],
  });

  return <BlockNoteView editor={editor} theme={theme} className="w-full" onChange={() => onDocumentChange(editor.document)} />;
}
