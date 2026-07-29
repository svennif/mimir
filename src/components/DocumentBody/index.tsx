"use client";

import { useEffect, useState } from "react";
import type { Block, PartialBlock } from "@blocknote/core";
import { useAutosave } from "@/src/hooks/use-autosave";
import { relativeTime, wordCount } from "@/src/lib/format";
import { documentToPlainText } from "@/src/lib/blocknote-text";
import { Editor } from "../Editor";

export function DocumentBody({
  pageId,
  initialContent,
  initialVersion,
  initialTitle,
  initialTextContent,
  initialUpdatedAt,
}: {
  pageId: string;
  initialContent: PartialBlock[];
  initialVersion: number;
  initialTitle: string;
  initialTextContent: string;
  initialUpdatedAt: Date;
}) {
  const { schedule, status, savedAt } = useAutosave(pageId, initialVersion, initialTitle);
  const [words, setWords] = useState(() => wordCount(initialTextContent));

  // Re-render every 30s so "just now" ages into "2 minutes ago"
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleChange = (blocks: Block[]) => {
    setWords(wordCount(documentToPlainText(blocks)));
    schedule(blocks);
  };

  const editedLabel =
    status === "saving"
      ? "Saving…"
      : `Edited ${relativeTime(savedAt ?? initialUpdatedAt)}`;

  return (
    <>
      <div className="flex w-full flex-col items-start overflow-clip pb-3">
        <p className="text-sm/5 text-ink-tertiary" suppressHydrationWarning>
          {`${editedLabel}  ·  ${words} words  ·  Private`}
        </p>

        {status === "error" && (
          <p className="mt-1 text-sm/5 text-red-600">
            Couldn&apos;t save — will retry on your next edit.
          </p>
        )}

        {status === "conflict" && (
          <p className="mt-1 text-sm/5 text-red-600">
            This page changed elsewhere.{" "}
            <button onClick={() => window.location.reload()} className="underline">
              Reload
            </button>
          </p>
        )}
      </div>

      <Editor initialContent={initialContent} onDocumentChange={handleChange} />
    </>
  );
}