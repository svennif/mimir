'use client';

import { restorePage } from '@/src/actions/pages';
import { useTransition } from 'react';

export function RestoreButton({ pageId }: { pageId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button type="button" className='cursor-pointer' onClick={() => startTransition(() => restorePage(pageId))} disabled={pending}>
      Restore
    </button>
  );
}
