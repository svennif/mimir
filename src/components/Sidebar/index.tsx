'use client';

import Image from 'next/image';
import Logo from '@/public/idk_logo.png';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/notes', label: 'Notes' },
];

export default function Sidebar({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 overflow-y-auto px-3 pb-4 pt-3.5">
      <section className="flex flex-row gap-2 items-center">
        <Image src={Logo} alt="Logo" width={52} height={52} loading="eager" />
        <p>Mirmir</p>
      </section>
      <section>
        <nav>
          <ul>
            {navItems.map((item) => {
              const isActive = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
              return (
                <Link key={item.to} href={item.to} onClick={onClick} className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
                  {item.label}
                </Link>
              );
            })}
          </ul>
        </nav>
      </section>
    </aside>
  );
}
