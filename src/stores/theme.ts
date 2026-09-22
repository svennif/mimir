'use client';

import { useSyncExternalStore } from 'react';
import { createStore } from './create-store';
import { THEME_COOKIE, THEME_MAX_AGE, type ResolvedTheme, type Theme } from '@/src/lib/theme';

export const themeStore = createStore<{ theme: Theme }>({ theme: 'system' });

/** Read back what the root layout painted, rather than re-parsing the cookie. */
function themeFromDocument(): Theme {
  const { classList } = document.documentElement;
  if (classList.contains('dark')) return 'dark';
  if (classList.contains('light')) return 'light';
  return 'system';
}

// Seed at module load, not in a component: the editor mounts late (dynamic,
// ssr: false) from any route, and must not read the 'system' default when the
// user has actually chosen. The SSR snapshot stays pristine — createStore's
// getServerSnapshot reads `initial`, so hydration still matches.
if (typeof document !== 'undefined') {
  themeStore.setState({ theme: themeFromDocument() });
}

export const themeActions = {
  set: (theme: Theme) => {
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${THEME_MAX_AGE}; samesite=lax`;
    // React rendered <html> on the server and won't re-render it for a client
    // state change, so the class is ours to move from here on.
    const { classList } = document.documentElement;
    classList.remove('light', 'dark');
    if (theme !== 'system') classList.add(theme);
    themeStore.setState({ theme });
  },
};

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToSystem(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * The concrete light/dark in effect. CSS resolves `system` on its own, so this
 * is only for the JS that can't — BlockNote has to be handed a string.
 */
export function useResolvedTheme(): ResolvedTheme {
  const theme = themeStore((s) => s.theme);
  const system = useSyncExternalStore(
    subscribeToSystem,
    () => (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'),
    () => 'light' as const, // server snapshot — must be a stable constant
  );
  return theme === 'system' ? system : theme;
}
