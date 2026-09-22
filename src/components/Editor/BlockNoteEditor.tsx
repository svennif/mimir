'use client';

import { BlockNoteContext, useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import type { Theme } from '@blocknote/mantine';
import type { PartialBlock, Block } from '@blocknote/core';
import { useResolvedTheme } from '@/src/stores/theme';
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

export default function BlockNoteEditor({ initialContent, onDocumentChange }: { initialContent?: PartialBlock[]; onDocumentChange: (blocks: Block[]) => void }) {
  const editor = useCreateBlockNote({
    initialContent: initialContent?.length ? initialContent : [{ type: 'heading', props: { level: 1 } }],
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
