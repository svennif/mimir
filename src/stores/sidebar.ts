'use client';

import { createStore } from './create-store';
import { SIDEBAR_COLLAPSED_COOKIE, SIDEBAR_COOKIE_MAX_AGE, SIDEBAR_WIDTH_COOKIE } from '@/src/lib/sidebar';

function writeCookie(name: string, value: string | number | boolean) {
  document.cookie = `${name}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; samesite=lax`;
}

// `collapsed` and `width` are null until the user changes them: the server
// snapshot always reads this initial state, so the shell falls back to the
// cookie values it was handed.
export const sidebarStore = createStore<{ expanded: Set<string>; collapsed: boolean | null; width: number | null }>({
  expanded: new Set(),
  collapsed: null,
  width: null,
});

// Actions live outside the store object — plain functions, no `set` closure.
export const sidebarActions = {

  toggle: (id: string) =>
    sidebarStore.setState((s) => {
      const next = new Set(s.expanded);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expanded: next };
    }),

  expand: (id: string) =>
    sidebarStore.setState((s) =>
      s.expanded.has(id) ? {} : { expanded: new Set(s.expanded).add(id) },
    ),

  // `fallback` is what the server rendered, used until the first toggle.
  toggleCollapsed: (fallback: boolean) =>
    sidebarStore.setState((s) => {
      const collapsed = !(s.collapsed ?? fallback);
      writeCookie(SIDEBAR_COLLAPSED_COOKIE, collapsed);
      return { collapsed };
    }),

  // Called on every pointer move while dragging — store only, no cookie.
  setWidth: (width: number) => sidebarStore.setState({ width }),

  // Called once, when the drag ends.
  saveWidth: () => {
    const { width } = sidebarStore.getState();
    if (width !== null) writeCookie(SIDEBAR_WIDTH_COOKIE, width);
  },
};
