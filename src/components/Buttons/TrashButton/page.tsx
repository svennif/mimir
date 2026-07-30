'use client';

import { trashPage } from '@/src/actions/pages';
import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

export function TrashButton({ pageId }: { pageId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button type="button" aria-label="Trash" onClick={() => startTransition(() => trashPage(pageId))} disabled={pending} className="flex size-8 shrink-0 items-center justify-center text-ink-secondary transition-colors hover:bg-hover hover:text-ink cursor-pointer">
      <Trash2 className="size-4" />
    </button>
  );
}
