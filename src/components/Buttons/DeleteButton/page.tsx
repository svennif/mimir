'use client';

import { Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { DeleteModal } from '../../DeleteModal/page';
import { deletePage } from '@/src/actions/pages';

export function DeleteButton({ pageId, pageTitle }: { pageId: string; pageTitle: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Delete ${pageTitle} forever`} className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-line border-red bg-sheet px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:border-red-500 hover:text-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">
        <Trash2 className="size-4" />
        Delete
      </button>
      <DeleteModal open={open} pending={pending} pageTitle={pageTitle} onCancel={() => setOpen(false)} onConfirm={() => startTransition(() => deletePage(pageId))} />
    </>
  );
}
