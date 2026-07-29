"use client";

import { createPage } from "@/src/actions/pages";
import { useTransition } from "react";

export function NewPageButton({
  parentId = null,
  icon,
  label = "New page",
  className,
}: {
  parentId?: string | null;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => createPage(parentId))}
      disabled={pending}
      className={className}
    >
      {icon && <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>}
      <span className="min-w-0 flex-1 truncate text-left">
        {pending ? "Creating…" : label}
      </span>
    </button>
  );
}