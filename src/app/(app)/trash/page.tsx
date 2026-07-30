import { RestoreButton } from '@/src/components/Buttons/RestoreButton/page';
import { db } from '@/src/db';
import { relativeTime } from '@/src/lib/format';

export default async function TrashPage() {
  const trashed = await db.query.pages.findMany({
    where: { deletedAt: { isNotNull: true } },
    orderBy: { deletedAt: 'desc' },
  });

  return (
    <>
      <h1>Trashed pages</h1>
      <ul>
        {trashed.map((p) => (
          <li key={p.id}>
            <span>
              {p.icon} {p.title || 'Untitled'}
            </span>
            <span>deleted {relativeTime(p.deletedAt!)}</span>
            <RestoreButton pageId={p.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
