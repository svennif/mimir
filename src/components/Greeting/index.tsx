'use client';

import { useSyncExternalStore } from 'react';

// Nothing to subscribe to — the text only has to be right when the page loads.
const subscribe = () => () => {};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function today(): string {
  return new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}

/**
 * The server doesn't know the reader's timezone, so both lines render empty on
 * the server (snapshot null) and fill in on hydration. Fixed line heights keep
 * the header from shifting when they do. Snapshots are strings, so repeated
 * reads compare equal and don't loop.
 */
export function Greeting() {
  const hello = useSyncExternalStore(subscribe, greeting, () => null);
  const date = useSyncExternalStore(subscribe, today, () => null);

  return (
    <div>
      <h1 className="h-7 text-xl font-semibold tracking-[-0.02em] text-ink">{hello}</h1>
      <p className="mt-1 h-5 text-sm text-ink-secondary">{date}</p>
    </div>
  );
}
