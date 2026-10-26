import { and, asc, isNotNull, isNull } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { db } from '@/src/db';
import { pages } from '@/src/db/schema';
import { getDisplayName } from '@/src/db/queries';
import { requireAuth } from '@/src/lib/auth';
import { SIDEBAR_COLLAPSED_COOKIE, SIDEBAR_WIDTH_COOKIE, parseSidebarWidth } from '@/src/lib/sidebar';
import { Sidebar } from '@/src/components/Sidebar';
import { SidebarShell } from '@/src/components/Sidebar/mobile-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  const cookieStore = await cookies();
  const collapsed = cookieStore.get(SIDEBAR_COLLAPSED_COOKIE)?.value === 'true';
  const width = parseSidebarWidth(cookieStore.get(SIDEBAR_WIDTH_COOKIE)?.value);

  const nodes = await db
    .select({
      id: pages.id,
      parentId: pages.parentId,
      title: pages.title,
      icon: pages.icon,
      position: pages.position,
    })
    .from(pages)
    .where(isNull(pages.deletedAt))
    .orderBy(asc(pages.position));

  const favourites = await db
    .select({ id: pages.id, title: pages.title, icon: pages.icon })
    .from(pages)
    .where(and(isNotNull(pages.favoritePosition), isNull(pages.deletedAt)))
    .orderBy(asc(pages.favoritePosition));

  const name = await getDisplayName();

  return (
    <SidebarShell initialCollapsed={collapsed} initialWidth={width} sidebar={<Sidebar tree={nodes} favourites={favourites} name={name} />}>
      {children}
    </SidebarShell>
  );
}
