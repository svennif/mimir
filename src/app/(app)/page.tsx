import Link from 'next/link';
import type { Metadata } from 'next';
import { Clock, FileText, Plus, Star } from 'lucide-react';
import { db } from '@/src/db';
import { relativeTime } from '@/src/lib/format';
import { TOOLBAR_CLEARANCE } from '@/src/lib/toolbar';
import { Greeting } from '@/src/components/Greeting';
import { NewPageButton } from '@/src/components/Buttons/NewPageButton/page';

export const metadata: Metadata = { title: 'Home' };

const RECENT_LIMIT = 8;

export default async function Home() {
  const [recent, favourites] = await Promise.all([
    db.query.pages.findMany({
      where: { deletedAt: { isNull: true } },
      orderBy: { updatedAt: 'desc' },
      limit: RECENT_LIMIT,
      columns: { id: true, title: true, icon: true, updatedAt: true },
    }),
    db.query.pages.findMany({
      where: { favoritePosition: { isNotNull: true }, deletedAt: { isNull: true } },
      orderBy: { favoritePosition: 'asc' },
      columns: { id: true, title: true, icon: true },
    }),
  ]);

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden border border-line bg-sheet shadow-sheet md:rounded-lg">
      <header className={`flex shrink-0 items-start justify-between gap-6 border-b border-line px-5 pb-5 md:px-8 md:pb-7 ${TOOLBAR_CLEARANCE}`}>
        <Greeting />
        <NewPageButton
          label="New page"
          icon={<Plus className="size-4" />}
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-line px-2.5 text-sm/5 font-medium text-ink-secondary transition-colors hover:bg-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        />
      </header>

      {recent.length === 0 ? (
        <div className="flex min-h-64 flex-1 items-center justify-center px-6 py-16 text-center">
          <div className="flex max-w-64 flex-col items-center">
            <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-hover text-ink-tertiary">
              <FileText className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-semibold text-ink">No pages yet</h2>
            <p className="mt-1.5 text-sm/5 text-ink-secondary">Create your first page to get started.</p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-xs/4 font-medium text-ink-tertiary">
              <Clock className="size-3.5" aria-hidden="true" />
              Jump back in
            </h2>
            <ul className="flex flex-col gap-2" aria-label="Recently edited pages">
              {recent.map((page) => (
                <li key={page.id}>
                  <Link href={`/pages/${page.id}`} className="flex items-center gap-3 rounded-md border border-line px-3 py-3 transition-colors hover:bg-hover md:px-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-hover text-base text-ink-secondary">{page.icon || <FileText className="size-4" aria-hidden="true" />}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{page.title || 'Untitled'}</p>
                      <time className="mt-0.5 block text-xs text-ink-tertiary" dateTime={page.updatedAt.toISOString()} title={page.updatedAt.toLocaleString()}>
                        Edited {relativeTime(page.updatedAt)}
                      </time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {favourites.length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-xs/4 font-medium text-ink-tertiary">
                <Star className="size-3.5" aria-hidden="true" />
                Favourites
              </h2>
              <ul className="flex flex-wrap gap-2" aria-label="Favourite pages">
                {favourites.map((page) => (
                  <li key={page.id} className="min-w-0">
                    <Link href={`/pages/${page.id}`} className="flex h-8 max-w-64 items-center gap-2 rounded-md border border-line px-2.5 text-sm/5 font-medium text-ink-secondary transition-colors hover:bg-hover hover:text-ink">
                      <span className="flex size-5 shrink-0 items-center justify-center">{page.icon || <FileText className="size-4" aria-hidden="true" />}</span>
                      <span className="truncate">{page.title || 'Untitled'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
