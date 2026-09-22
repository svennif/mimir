// The single toolbar line across the top of a page sheet: the sidebar toggle at
// its left end (SidebarShell), the page's own actions at its right
// (DocumentSheet). Both ends read from here so they can't drift apart.
//
// Full class strings, not numbers — Tailwind only emits classes it can see
// spelled out in the source.
export const TOOLBAR_ROW = 'absolute top-3 z-20 flex items-center';
// No display utility here on purpose: call sites mix in `flex` / `hidden md:flex`,
// and two display classes in one string resolve by stylesheet order, not by order
// of appearance.
export const TOOLBAR_BUTTON = 'size-8 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-hover hover:text-ink';

/** Top padding a sheet's own content needs to clear TOOLBAR_ROW. */
export const TOOLBAR_CLEARANCE = 'pt-14';
