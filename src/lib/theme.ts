// Shared by the server (root layout, which paints the class) and the client
// (the store, which repaints it on a toggle). No 'use client' — both sides
// import this.

export const THEME_COOKIE = 'theme';
export const THEME_MAX_AGE = 31536000; // one year, matching sidebar_collapsed

/** What the user picked. */
export type Theme = 'light' | 'dark' | 'system';

/** What that actually means right now — `system` resolved against the OS. */
export type ResolvedTheme = 'light' | 'dark';

export const THEMES: Theme[] = ['light', 'dark', 'system'];

export function parseTheme(value: string | undefined): Theme {
  return value === 'light' || value === 'dark' ? value : 'system';
}

/**
 * The class for <html>. `system` deliberately gets no class so the
 * prefers-color-scheme block in globals.css takes over; `light` gets one
 * anyway, because that block is written as `:root:not(.light)`.
 */
export function themeClass(theme: Theme): string {
  return theme === 'system' ? '' : theme;
}
