import { Sidebar } from '@/src/components/Sidebar';
import { db } from '@/src/db';
import { getSession } from '@/src/lib/session';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { loggedIn } = await getSession();
  if (!loggedIn) redirect('/login');

  const tree = await db.query.pages.findMany({
    where: { parentId: { isNull: true }, deletedAt: { isNull: true } },
    orderBy: { position: 'asc' },
    with: {
      children: {
        where: { deletedAt: { isNull: true } },
        orderBy: { position: 'asc' },
      },
    },
  });

  return (
    <div className="flex size-full items-start">
      <Sidebar tree={tree} />
      <div className="flex h-full min-w-0 flex-1 flex-col items-start overflow-clip pt-3.5 pr-4 pb-4 pl-1">{children}</div>
    </div>
  );
}
