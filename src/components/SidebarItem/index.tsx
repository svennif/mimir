"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarItem({
  href, icon, label, depth = 0,
}: { href: string; icon: React.ReactNode; label: string; depth?: number }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <div className="flex w-full items-start overflow-clip" style={{ paddingLeft: depth * 20 }}>
      <Link
        href={href}
        className={`flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm/5 font-medium transition-colors ${
          active ? "bg-active text-ink" : "text-ink-secondary hover:bg-hover"
        }`}
      >
        <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </Link>
    </div>
  );
}