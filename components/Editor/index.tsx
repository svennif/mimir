'use client'

import dynamic from 'next/dynamic';

// BlockNote touches `window` during render, so it cannot be server-rendered.
// Loading it with ssr: false keeps it client-only (must be done from a Client Component).
const BlockNoteEditor = dynamic(() => import('./BlockNoteEditor'), {
  ssr: false,
});

export default function NoteEditor() {
  return <BlockNoteEditor />;
}
