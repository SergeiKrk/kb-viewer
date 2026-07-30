import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { KBPage } from '../types';
import { Search, FileText, Hash, CornerDownLeft, X, BookOpen } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  pages: KBPage[];
  kb: string;
  onNavigate: (slug: string) => void;
}

interface FuseResult {
  item: KBPage;
  score: number;
  matches?: readonly Fuse.FuseResultMatch[];
}

// Highlight match indices within text, returning JSX spans
function highlightMatches(text: string, indices: readonly [number, number][] | undefined): React.ReactNode {
  if (!indices || indices.length === 0) return text;

  // Sort and merge overlapping indices
  const sorted = [...indices].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of sorted) {
    if (merged.length === 0) {
      merged.push([start, end]);
    } else {
      const last = merged[merged.length - 1];
      if (start <= last[1] + 1) {
        last[1] = Math.max(last[1], end);
      } else {
        merged.push([start, end]);
      }
    }
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) {
      parts.push(text.slice(cursor, start));
    }
    parts.push(
      <mark key={`${start}-${end}`} className="bg-yellow-200 dark:bg-yellow-800/50 text-inherit rounded-sm px-0.5">
        {text.slice(start, end + 1)}
      </mark>
    );
    cursor = end + 1;
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }
  return <>{parts}</>;
}

// Extract a preview snippet around match positions from content
function getPreview(content: string, matches: readonly Fuse.FuseResultMatch[] | undefined, query: string): { text: string; indices: [number, number][] | undefined } {
  if (!matches || matches.length === 0) {
    // Fallback: show beginning of content
    const text = content.slice(0, 200).replace(/\s+/g, ' ').trim();
    return { text: text + (content.length > 200 ? '...' : ''), indices: undefined };
  }

  // Find content matches
  const contentMatch = matches.find(m => m.key === 'content');
  if (!contentMatch || !contentMatch.indices || contentMatch.indices.length === 0) {
    const text = content.slice(0, 200).replace(/\s+/g, ' ').trim();
    return { text: text + (content.length > 200 ? '...' : ''), indices: undefined };
  }

  // Center preview around first content match
  const firstIdx = contentMatch.indices[0];
  const matchCenter = firstIdx[0];
  const snippetRadius = 120;
  const start = Math.max(0, matchCenter - snippetRadius);
  const end = Math.min(content.length, matchCenter + snippetRadius);

  let snippet = content.slice(start, end).replace(/\s+/g, ' ').trim();
  const prefix = start > 0 ? '...' : '';
  const suffix = end < content.length ? '...' : '';
  snippet = prefix + snippet + suffix;

  // Adjust indices relative to snippet start
  const adjustedIndices: [number, number][] = contentMatch.indices.map(([s, e]) => {
    const offset = start - (prefix ? 3 : 0);
    return [s - offset, e - offset] as [number, number];
  }).filter(([s, e]) => s >= 0 && e < snippet.length);

  return { text: snippet, indices: adjustedIndices.length > 0 ? adjustedIndices : undefined };
}

export default function SearchDialog({ open, onClose, pages, kb, onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      // Focus input with a small delay for animation
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Configure Fuse.js
  const fuse = useMemo(() => new Fuse(pages, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'content', weight: 0.3 },
      { name: 'tags', weight: 0.2 },
    ],
    includeMatches: true,
    includeScore: true,
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 1,
    ignoreLocation: false,
  }), [pages]);

  // Search results
  const results: FuseResult[] = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query.trim());
  }, [fuse, query]);

  // Clamp selected index when results change
  useEffect(() => {
    setSelectedIdx(prev => Math.min(prev, Math.max(0, results.length - 1)));
  }, [results.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIdx] as HTMLElement | undefined;
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIdx]);

  const handleSelect = useCallback((slug: string) => {
    onNavigate(slug);
    onClose();
  }, [onNavigate, onClose]);

  // Keyboard handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIdx(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIdx(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIdx]) {
          handleSelect(results[selectedIdx].item.slug);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [results, selectedIdx, handleSelect, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const noResults = hasQuery && results.length === 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative w-full max-w-xl mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск по страницам..."
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSelectedIdx(0); inputRef.current?.focus(); }}
              className="shrink-0 w-6 h-6 rounded flex items-center justify-center hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <kbd className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-muted-foreground">
            Esc
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-[60vh] overflow-y-auto">
          {noResults ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Ничего не найдено</p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Попробуйте изменить поисковый запрос
              </p>
            </div>
          ) : results.length > 0 ? (
            <ul ref={listRef} role="listbox" className="py-2">
              {results.map((result, idx) => {
                const page = result.item;
                const isSelected = idx === selectedIdx;
                const { text: previewText, indices: previewIndices } = getPreview(
                  page.content, result.matches, query
                );
                const titleMatches = result.matches?.find(m => m.key === 'title');
                const tagMatches = result.matches?.find(m => m.key === 'tags');

                return (
                  <li
                    key={page.slug}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(page.slug)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className={`
                      px-4 py-3 mx-2 rounded-lg cursor-pointer transition-colors
                      ${isSelected
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted/50'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <FileText className={`w-4 h-4 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Title with match highlight */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {highlightMatches(page.title, titleMatches?.indices as [number, number][] | undefined)}
                          </span>
                          {/* KB badge */}
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {kb}
                          </span>
                        </div>

                        {/* Content preview with match highlight */}
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {highlightMatches(previewText, previewIndices)}
                        </p>

                        {/* Tags */}
                        {page.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <Hash className="w-3 h-3 text-muted-foreground/50" />
                            {page.tags.map(tag => {
                              const isTagMatch = tagMatches?.indices?.some(
                                ([s, e]) => tag.includes(query.trim())
                              );
                              return (
                                <span
                                  key={tag}
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    isTagMatch
                                      ? 'bg-yellow-200/70 dark:bg-yellow-800/40 text-yellow-900 dark:text-yellow-200'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Enter hint */}
                      {isSelected && (
                        <div className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : hasQuery ? null : (
            /* Empty state before typing */
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Начните вводить запрос для поиска
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Поиск по заголовкам, содержимому и тегам
              </p>
              <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground/50">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">↑↓</kbd>
                  {' '}навигация
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">↵</kbd>
                  {' '}открыть
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Esc</kbd>
                  {' '}закрыть
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer with result count */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Найдено: <strong className="text-foreground">{results.length}</strong> {plural(results.length, 'страница', 'страницы', 'страниц')}
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">↑↓</kbd>
              {' '}навигация
              <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">↵</kbd>
              {' '}открыть
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
