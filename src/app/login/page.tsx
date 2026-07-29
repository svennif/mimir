'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);
  return (
    <div className="flex size-full items-center justify-center bg-canvas">
      <div className="w-90 rounded-lg border border-line bg-sheet p-8 shadow-sheet">
        <div className="mb-6 flex size-5.5 items-center justify-center rounded-[11px] bg-accent text-[13px] font-semibold text-ink-inverse">M</div>

        <h1 className="text-2xl/8 font-semibold text-ink">Welcome back</h1>
        <p className="mt-1 mb-6 text-sm/5 text-ink-secondary">Enter your password to continue</p>

        <form action={formAction} className="flex flex-col gap-3">
          <input name="password" type="password" autoFocus autoComplete="current-password" placeholder="Password" className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-tertiary focus:border-accent" />

          {state?.error && <span className="text-sm text-red-600">{state.error}</span>}

          <button type="submit" disabled={pending} className="w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-ink-inverse disabled:opacity-60">
            {pending ? 'Checking…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
