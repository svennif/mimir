'use client';

import { useActionState } from 'react';
import { saveDisplayName } from '@/src/actions/settings';
import { DISPLAY_NAME_MAX } from '@/src/lib/settings';

export function DisplayNameForm({ initialName }: { initialName: string | null }) {
  const [state, formAction, pending] = useActionState(saveDisplayName, null);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex w-full gap-2">
        <input
          name="name"
          defaultValue={initialName ?? ''}
          maxLength={DISPLAY_NAME_MAX}
          autoComplete="given-name"
          placeholder="Your name"
          aria-label="Name"
          className="min-w-0 flex-1 rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-tertiary focus:border-accent"
        />
        <button type="submit" disabled={pending} className="shrink-0 cursor-pointer rounded-md bg-accent px-3 py-2 text-sm font-semibold text-ink-inverse disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? 'Saving…' : 'Save'}
        </button>
      </div>
      {state && 'error' in state && <span className="text-sm text-red-600">{state.error}</span>}
      {state && 'ok' in state && !pending && <span className="text-sm text-ink-secondary">Saved</span>}
    </form>
  );
}
