// Shared by the server (app layout, which reads the cookies) and the client
// (the store, which writes them). No 'use client' — both sides import this.

export const SIDEBAR_COLLAPSED_COOKIE = 'sidebar_collapsed';
export const SIDEBAR_WIDTH_COOKIE = 'sidebar_width';
export const SIDEBAR_COOKIE_MAX_AGE = 31536000; // one year

export const SIDEBAR_MIN_WIDTH = 260;
export const SIDEBAR_DEFAULT_WIDTH = 260;
export const SIDEBAR_MAX_WIDTH = 600;

export function clampSidebarWidth(width: number): number {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
}

/** The cookie is user input — a missing or hand-edited value still lands in range. */
export function parseSidebarWidth(value: string | undefined): number {
  const width = Number(value); // Number(undefined) is NaN, so a missing cookie falls through
  return Number.isFinite(width) ? clampSidebarWidth(width) : SIDEBAR_DEFAULT_WIDTH;
}
