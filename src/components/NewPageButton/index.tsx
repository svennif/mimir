'use client';

import { useTransition } from 'react';
import { createPage } from '@/src/app/actions/pages';

export function NewPageButton({ parentId = null }: { parentId?: string | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <button onClick={() => startTransition(() => createPage(parentId))} disabled={pending}>
      {pending ? 'Creating...' : '+ New Page'}
    </button>
  );
}
