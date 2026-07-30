'use client';

import { FileText, Folder } from 'lucide-react';
import { SidebarItem } from '../SidebarItem';

export type PageNode = {
  id: string;
  title: string;
  icon: string | null;
  children?: PageNode[];
};

export function PageTree({ nodes, depth = 0 }: { nodes: PageNode[]; depth?: number }) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = !!node.children?.length;
        return (
          <div key={node.id} className="w-full">
            <SidebarItem href={`/pages/${node.id}`} pageId={node.id} depth={depth} label={node.title || 'Untitled'} icon={node.icon ? <span className="text-sm leading-none">{node.icon}</span> : hasChildren ? <Folder className="size-4" /> : <FileText className="size-4" />} />
            {hasChildren && <PageTree nodes={node.children!} depth={depth + 1} />}
          </div>
        );
      })}
    </>
  );
}
