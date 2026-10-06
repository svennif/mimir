'use client';

import { trashPage } from '@/src/actions/pages';
import { Trash2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';

export function TrashButton({ pageId }: { pageId: string }) {
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const viewingId = pathname.startsWith('/pages/') ? pathname.slice('/pages/'.length) : undefined;

  return (
    <button
      type="button"
      aria-label="Trash"
      onClick={() =>
        startTransition(async () => {
          await trashPage(pageId, viewingId);
        })
      }
      disabled={pending}
      className="flex size-8 shrink-0 items-center justify-center text-ink-secondary transition-colors hover:bg-hover hover:text-ink cursor-pointer">
      <Trash2 className="size-4" />
    </button>
  );
}
