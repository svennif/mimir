import { Star, MessageSquare, MoreHorizontal } from 'lucide-react';
import { TOOLBAR_BUTTON, TOOLBAR_ROW } from '@/src/lib/toolbar';

export function DocumentSheet({ children, isFavorite }: { children: React.ReactNode; isFavorite: boolean }) {
  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col items-start overflow-clip md:rounded-lg border border-line bg-sheet shadow-sheet">
      <div className={`${TOOLBAR_ROW} right-4`}>
        <button name='Favourite' className={`${TOOLBAR_BUTTON} flex`}>
          <Star className={`size-4 ${isFavorite ? 'fill-accent text-accent' : ''}`} />
        </button>
        <button name='Comment' className={`${TOOLBAR_BUTTON} flex`}>
          <MessageSquare className="size-4" />
        </button>
        <button name='Menu' className={`${TOOLBAR_BUTTON} flex`}>
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <div className="flex min-h-0 w-full flex-1 items-start justify-center overflow-y-auto pt-15 pb-15 md:pt-16">
        <div className="flex w-full max-w-177 shrink-0 flex-col items-start gap-1.5 px-6 md:px-8 lg:px-10"> {children}</div>
      </div>
    </div>
  );
}
