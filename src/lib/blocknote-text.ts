import type { Block } from "@blocknote/core";

type InlineNode =
  | { type: "text"; text: string }
  | { type: "link"; content: InlineNode[] }
  | { type: string };

function isTextNode(node: InlineNode): node is { type: "text"; text: string } {
  return "text" in node && typeof node.text === "string";
}

function hasContent(node: InlineNode): node is { type: "link"; content: InlineNode[] } {
  return "content" in node && Array.isArray(node.content);
}

function inlineText(content: unknown): string {
  if (!Array.isArray(content)) return ""; // table cells etc. aren't arrays
  return (content as InlineNode[])
    .map((node) => {
      if (isTextNode(node)) return node.text;
      if (hasContent(node)) return inlineText(node.content);
      return "";
    })
    .join("");
}

function blockContent(block: Block): unknown {
  return (block as { content?: unknown }).content;
}

export function extractTitle(blocks: Block[]): string {
  const first = blocks[0];
  return first ? inlineText(blockContent(first)).trim().slice(0, 200) : "";
}

export function documentToPlainText(blocks: Block[]): string {
  const out: string[] = [];

  const walk = (list: Block[]): void => {
    for (const block of list) {
      const text = inlineText(blockContent(block));
      if (text) out.push(text);
      if (block.children.length > 0) walk(block.children);
    }
  };

  walk(blocks);
  return out.join("\n");
}