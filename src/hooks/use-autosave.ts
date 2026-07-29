"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Block } from "@blocknote/core";
import { documentToPlainText, extractTitle } from "../lib/blocknote-text";
import { savePage } from "../actions/pages";
import { useRouter } from "next/navigation";

const DEBOUNCE_MS = 2000;
const MAX_WAIT_MS = 10000;

type Status = "idle" | "dirty" | "saving" | "saved" | "conflict" | "error";

export function useAutosave(pageId: string, initialVersion: number, initialTitle: string) {
  const router = useRouter();
  const version = useRef(initialVersion);
  const lastTitle = useRef(initialTitle);
  const pending = useRef<Block[] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstDirtyAt = useRef<number | null>(null);
  const paused = useRef(false);
  const [status, setStatus] = useState<Status>("idle");

  const flush = useCallback(async () => {
    if (paused.current || !pending.current) return;

    const blocks = pending.current;
    pending.current = null;
    firstDirtyAt.current = null;
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }

    setStatus("saving");
    const title = extractTitle(blocks);

    try {
      const res = await savePage({
        pageId,
        content: blocks,
        textContent: documentToPlainText(blocks),
        title,
        clientVersion: version.current,
        revalidateTree: title !== lastTitle.current,
      });

      if (!res.ok) {
        paused.current = true; // stop the loop; don't retry into a wall
        setStatus("conflict");
        return;
      }

      const titleChanged = title !== lastTitle.current; // compare BEFORE assigning

      version.current = res.version;
      lastTitle.current = title;
      setStatus("saved");

      if (titleChanged) router.refresh();
    } catch (err) {
      console.error("savePage failed:", err);
      setStatus("error");
    }
  }, [pageId, router]);

  const schedule = useCallback((blocks: Block[]) => {
    if (paused.current) return;

    pending.current = blocks;
    setStatus("dirty");

    const now = Date.now();
    firstDirtyAt.current ??= now;

    if (timer.current) clearTimeout(timer.current);

    // Debounce 2s, but never wait more than 10s since the first unsaved change
    const elapsed = now - firstDirtyAt.current;
    const wait = Math.min(DEBOUNCE_MS, Math.max(0, MAX_WAIT_MS - elapsed));
    timer.current = setTimeout(flush, wait);
  }, [flush]);

  useEffect(() => {
    const onHide = () => { if (pending.current) void flush(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      if (pending.current) void flush(); // unmount = navigated away
    };
  }, [flush]);

  return { schedule, status };
}