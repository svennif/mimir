import Link from 'next/link';
import { db } from '@/src/db';

export default async function FavoritesPage() {
  const favorites = await db.query.pages.findMany({
    where: { favoritePosition: { isNotNull: true }, deletedAt: { isNull: true } },
    orderBy: { favoritePosition: 'asc' },
  });

  if (favorites.length === 0) {
    return <p>No favorites yet. Star a page to pin it here.</p>;
  }

  return (
    <ul>
      {favorites.map((p) => (
        <li key={p.id}>
          <Link href={`/pages/${p.id}`}>
            {p.icon} {p.title || 'Untitled'}
          </Link>
        </li>
      ))}
    </ul>
  );
}
