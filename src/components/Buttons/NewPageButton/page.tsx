"use client";

import { createPage } from "@/src/actions/pages";
import { Plus } from "lucide-react";
import { useTransition } from "react";

// Icon-only by default (sits next to TrashButton on a sidebar row).
// Pass a label to get the wide "Add a page" style row instead.
export function NewPageButton({
  parentId = null,
  icon = <Plus className="size-4" />,
  label,
  className = "flex size-8 shrink-0 cursor-pointer items-center justify-center text-ink-secondary transition-colors hover:bg-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-50",
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
      aria-label={label ?? "New page"}
      onClick={() => startTransition(() => createPage(parentId))}
      disabled={pending}
      className={className}
    >
      <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
      {label && (
        <span className="min-w-0 flex-1 truncate text-left">
          {pending ? "Creating…" : label}
        </span>
      )}
    </button>
  );
}
