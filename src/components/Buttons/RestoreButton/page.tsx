'use client';

import { restorePage } from '@/src/actions/pages';
import { RotateCcw } from 'lucide-react';
import { useTransition } from 'react';

export function RestoreButton({ pageId, pageTitle }: { pageId: string; pageTitle: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-sheet px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() => startTransition(() => restorePage(pageId))}
      disabled={pending}
      aria-label={`Restore ${pageTitle}`}
    >
      <RotateCcw className={`size-3.5 ${pending ? 'animate-spin' : ''}`} aria-hidden="true" />
      {pending ? 'Restoring' : 'Restore'}
    </button>
  );
}
