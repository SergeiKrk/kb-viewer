import { useState } from 'react';
import type { TreeNode } from '../types';
import { Folder, FileText, ChevronRight, Star } from 'lucide-react';

interface Props {
  tree: TreeNode[];
  currentSlug: string;
  onNavigate: (slug: string) => void;
  kb: string;
  favorites: string[];
}

const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

function TreeNodeItem({
  node,
  depth,
  currentSlug,
  onNavigate,
  favorites,
}: {
  node: TreeNode;
  depth: number;
  currentSlug: string;
  onNavigate: (slug: string) => void;
  favorites: string[];
}) {
  const [expanded, setExpanded] = useState(true);
  const isDirectory = node.type === 'directory';
  const hasChildren = isDirectory && node.children && node.children.length > 0;
  const isActive = node.slug === currentSlug;
  const isFavorite = node.slug && favorites.includes(node.slug);

  const handleClick = () => {
    if (isDirectory) {
      setExpanded((prev) => !prev);
    } else if (node.slug) {
      onNavigate(node.slug);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 cursor-pointer rounded-md text-sm transition-colors group select-none',
          'hover:bg-accent',
          isActive && 'bg-accent text-primary font-medium',
        )}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={handleClick}
      >
        {/* Chevron for directories — invisible spacer for files */}
        {hasChildren ? (
          <ChevronRight
            className={cn(
              'w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-150',
              expanded && 'rotate-90',
            )}
          />
        ) : isDirectory ? (
          <span className="w-4 h-4 shrink-0" />
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}

        {/* Node icon */}
        {isDirectory ? (
          <Folder className="w-4 h-4 shrink-0 text-muted-foreground" />
        ) : (
          <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
        )}

        {/* Name */}
        <span className="truncate flex-1">{node.name}</span>

        {/* Favorite indicator */}
        {isFavorite && (
          <Star className="w-3.5 h-3.5 shrink-0 text-yellow-500 fill-yellow-500 opacity-80" />
        )}
      </div>

      {/* Recursive children */}
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              currentSlug={currentSlug}
              onNavigate={onNavigate}
              favorites={favorites}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ tree, currentSlug, onNavigate, kb: _kb, favorites }: Props) {
  return (
    <div className="h-full overflow-y-auto py-2">
      {tree.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No pages found
        </div>
      ) : (
        tree.map((node) => (
          <TreeNodeItem
            key={node.path}
            node={node}
            depth={0}
            currentSlug={currentSlug}
            onNavigate={onNavigate}
            favorites={favorites}
          />
        ))
      )}
    </div>
  );
}
