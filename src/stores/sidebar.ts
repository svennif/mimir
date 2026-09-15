'use client';

import { createStore } from './create-store';


export const sidebarStore = createStore<{ expanded: Set<string>; collapsed: boolean }>({
  expanded: new Set(),
  collapsed: false,
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

  toggleCollapsed: () =>
    sidebarStore.setState((s) => {
      document.cookie = `sidebar_collapsed=${!s.collapsed}; path=/; max-age=31536000; samesite=lax`;
      return { collapsed: !s.collapsed };
    }),
};