import { Star, MessageSquare, MoreHorizontal } from 'lucide-react';

export function DocumentSheet({ children, isFavorite }: { children: React.ReactNode; isFavorite: boolean }) {
  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col items-start overflow-clip md:rounded-lg border border-line bg-sheet shadow-sheet">
      {/* <div className="absolute top-4.25 right-5.75 z-10 flex items-center gap-3.5">
        <button className="flex size-5 items-center justify-center text-ink-secondary hover:text-ink">
          <Star className={`size-4 ${isFavorite ? "fill-accent text-accent" : ""}`} />
        </button>
        <button className="flex size-5 items-center justify-center text-ink-secondary hover:text-ink">
          <MessageSquare className="size-4" />
        </button>
        <button className="flex size-5 items-center justify-center text-ink-secondary hover:text-ink">
          <MoreHorizontal className="size-4" />
        </button>
      </div> */}

      <div className="flex min-h-0 w-full flex-1 items-start justify-center overflow-y-auto">
        <div className="flex w-full max-w-177 shrink-0 flex-col items-start gap-1.5 px-4 pt-15 pb-15 md:px-0 md:pt-16"> {children}</div>
      </div>
    </div>
  );
}
