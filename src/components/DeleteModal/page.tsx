'use client';
import { useEffect, useRef } from 'react';

export function DeleteModal({ open, pending, pageTitle, onCancel, onConfirm }: { open: boolean; pending: boolean; pageTitle: string; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  return (
    <dialog ref={ref} onCancel={onCancel} className="p-4 rounded-md m-auto">
      <h2>Delete forever?</h2>
      <p>“{pageTitle}” and everything inside it will be permanently deleted. This can’t be undone.</p>
      <div className="flex flex-row gap-2">
        <button type="button" onClick={onCancel} disabled={pending} className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-sheet px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-50">
          No
        </button>
        <button type="button" onClick={onConfirm} disabled={pending} className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-red px-2.5 text-xs font-semibold  transition-colors border-red-500 text-red-500 bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">
          {pending ? 'Deleting' : 'Yes, delete forever'}
        </button>
      </div>
    </dialog>
  );
}
