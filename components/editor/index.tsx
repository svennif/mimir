'use client'

import React from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

export default function NoteEditor() {
  const editor = useCreateBlockNote();

  return <BlockNoteView editor={editor} />;
}
