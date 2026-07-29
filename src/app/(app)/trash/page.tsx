import { db } from '@/src/db';

export default async function TrashPage() {
  const trashed = await db.query.pages.findMany({
    where: { deletedAt: { isNotNull: true } },
    orderBy: { deletedAt: 'desc' },
  });

  return <h1>Trash page</h1>;
}
