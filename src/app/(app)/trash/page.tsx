import { DeleteButton } from '@/src/components/Buttons/DeleteButton/page';
import { RestoreButton } from '@/src/components/Buttons/RestoreButton/page';
import { db } from '@/src/db';
import { relativeTime } from '@/src/lib/format';
import { FileText, Trash2 } from 'lucide-react';

export default async function TrashPage() {
  const trashed = await db.query.pages.findMany({
    where: { deletedAt: { isNotNull: true } },
    orderBy: { deletedAt: 'desc' },
  });

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden border border-line bg-sheet shadow-sheet md:rounded-lg">
      <header className="flex shrink-0 items-start justify-between gap-6 border-b border-line px-5 py-5 md:px-8 md:py-7">
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <Trash2 className="size-5 text-ink-secondary" aria-hidden="true" />
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">Trash</h1>
          </div>
          <p className="text-sm text-ink-secondary">Restore pages you want to keep.</p>
        </div>
        <span className="rounded-full bg-hover px-2.5 py-1 text-xs font-medium text-ink-secondary">
          {trashed.length} {trashed.length === 1 ? 'page' : 'pages'}
        </span>
      </header>

      {trashed.length === 0 ? (
        <div className="flex min-h-64 flex-1 items-center justify-center px-6 py-16 text-center">
          <div className="flex max-w-64 flex-col items-center">
            <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-hover text-ink-tertiary">
              <Trash2 className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-semibold text-ink">Your trash is empty</h2>
            <p className="mt-1.5 text-sm/5 text-ink-secondary">Deleted pages will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
          <ul className="overflow-hidden flex flex-col gap-2" aria-label="Deleted pages">
            {trashed.map((page) => {
              const title = page.title || 'Untitled';

              return (
                <li key={page.id} className="flex items-center gap-3 border border-line rounded-md px-3 py-3 hover:bg-hover md:px-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-hover text-base text-ink-secondary">{page.icon || <FileText className="size-4" aria-hidden="true" />}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{title}</p>
                    <time className="mt-0.5 block text-xs text-ink-tertiary" dateTime={page.deletedAt!.toISOString()} title={page.deletedAt!.toLocaleString()}>
                      Deleted {relativeTime(page.deletedAt!)}
                    </time>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <RestoreButton pageId={page.id} pageTitle={title} />
                    <DeleteButton pageId={page.id} pageTitle={title} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
