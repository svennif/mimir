'use client';

import { toggleFavourite } from '@/src/actions/pages';
import { TOOLBAR_BUTTON } from '@/src/lib/toolbar';
import { Star } from 'lucide-react';
import { useOptimistic, useTransition } from 'react';

export function FavouriteButton({ pageId, isFavourite }: { pageId: string; isFavourite: boolean }) {
  // Fills the star on click; once the action's revalidate lands, the new prop
  // takes over. If the action fails the prop never changes, so it reverts.
  const [starred, setStarred] = useOptimistic(isFavourite);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={starred ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={starred}
      onClick={() =>
        startTransition(async () => {
          setStarred(!starred);
          await toggleFavourite(pageId);
        })
      }
      className={`${TOOLBAR_BUTTON} flex cursor-pointer`}>
      <Star className={`size-4 ${starred ? 'fill-accent text-accent' : ''}`} />
    </button>
  );
}
