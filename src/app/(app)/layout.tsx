import { asc, isNull } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { db } from '@/src/db';
import { pages } from '@/src/db/schema';
import { requireAuth } from '@/src/lib/auth';
import { Sidebar } from '@/src/components/Sidebar';
import { SidebarShell } from '@/src/components/Sidebar/mobile-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  const collapsed = (await cookies()).get('sidebar_collapsed')?.value === 'true';

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

  return (
    <SidebarShell initialCollapsed={collapsed} sidebar={<Sidebar tree={nodes} />}>
      {children}
    </SidebarShell>
  );
}
