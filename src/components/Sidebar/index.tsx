'use client';

import Link from 'next/link';
import { NewPageButton } from '../NewPageButton';

type PageNode = {
  id: string;
  title: string;
  icon: string | null;
  children?: PageNode[];
};

export default function Sidebar({ pages }: { pages: PageNode[] }) {
  return (
    <aside className="w-64 shrink-0 overflow-y-auto px-3 pb-4 pt-3.5">
      <section className="flex flex-row gap-2 items-center">
      </section>
      <section className='flex flex-col gap-1.5'>
        <NewPageButton />
        <ul className='flex flex-col gap-1.5'>
          {pages.map((page) => (
            <li key={page.id} className='flex items-center text-sm'>
              <Link href={`/pages/${page.id}`}>
                {page.icon} {page.title || 'Untitled'}
              </Link>
              {page.children && page.children.length > 0 && (
                <ul>
                  {page.children.map((child) => (
                    <li key={child.id} className='flex items-center text-sm'>
                      <Link href={`/pages/${child.id}`}>
                        {child.icon} {child.title || 'Untitled'}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
