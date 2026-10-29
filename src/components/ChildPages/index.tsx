import Link from 'next/link';
import { FileText, Files } from 'lucide-react';
import { relativeTime } from '@/src/lib/format';

type ChildPage = { id: string; title: string; icon: string | null; updatedAt: Date };

/** The pages directly inside this one. Renders nothing for a page without children. */
export function ChildPages({ pages }: { pages: ChildPage[] }) {
  if (pages.length === 0) return null;

  return (
    <div className="mt-10 w-full">
      <h2 className="mb-2 flex items-center gap-2 text-xs/4 font-medium text-ink-tertiary">
        <Files className="size-3.5" aria-hidden="true" />
        Pages
      </h2>
      <ul className="flex flex-col gap-2" aria-label="Pages in this folder">
        {pages.map((page) => (
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
  );
}
