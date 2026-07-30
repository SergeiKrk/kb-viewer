import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { marked } from 'marked';
import type { KBPage, WikiLink } from '../types';
import { Star, Link, Hash, BookOpen, Tag, Link2 } from 'lucide-react';

interface Props {
  page: KBPage | null;
  pages: KBPage[];
  kb: string;
  onNavigate: (slug: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

// ─── Wiki-link pre-processing ───────────────────────────────────────────────

function processWikiLinks(raw: string, kb: string, allSlugs: Set<string>): string {
  // Protect code fences and inline code so wiki-link markers inside them are untouched
  const shelters: string[] = [];
  let protected_ = raw.replace(/```[\s\S]*?```/g, (m) => {
    shelters.push(m);
    return `\x00FENCE${shelters.length - 1}\x00`;
  });
  protected_ = protected_.replace(/`[^`\n]+`/g, (m) => {
    shelters.push(m);
    return `\x00CODE${shelters.length - 1}\x00`;
  });

  // Replace [[target]] with HTML anchors; style broken links differently
  protected_ = protected_.replace(
    /\[\[([^\]]+)\]\]/g,
    (_m: string, target: string) => {
      const t = target.trim();
      const exists = allSlugs.has(t);
      const cls = exists ? 'wiki-link' : 'wiki-link-broken';
      const href = exists ? `/kb/${kb}/${t}` : '#';
      return `<a href="${href}" class="${cls}" data-wiki-target="${t}">${t}</a>`;
    },
  );

  // Restore shelters
  for (let i = shelters.length - 1; i >= 0; i--) {
    protected_ = protected_.replace(`\x00FENCE${i}\x00`, shelters[i]);
    protected_ = protected_.replace(`\x00CODE${i}\x00`, shelters[i]);
  }
  return protected_;
}

// ─── Backlinks computation ──────────────────────────────────────────────────

function computeBacklinks(slug: string, pages: KBPage[]): WikiLink[] {
  const backlinks: WikiLink[] = [];
  for (const p of pages) {
    for (const link of p.links) {
      if (link.target === slug) {
        backlinks.push({
          target: link.target,
          title: p.title,
          exists: true,
          source: p.slug,
        });
      }
    }
  }
  return backlinks;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ArticleView({
  page,
  pages,
  kb,
  onNavigate,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Slug set for existence checks ──────────────────────────────────────
  const allSlugs = useMemo(() => new Set(pages.map((p) => p.slug)), [pages]);

  // ── Rendered HTML ──────────────────────────────────────────────────────
  const html = useMemo(() => {
    if (!page) return '';
    const processed = processWikiLinks(page.rawContent, kb, allSlugs);
    return marked.parse(processed, { async: false }) as string;
  }, [page, kb, allSlugs]);

  // ── Backlinks ──────────────────────────────────────────────────────────
  const backlinks = useMemo(() => {
    if (!page) return [];
    return computeBacklinks(page.slug, pages);
  }, [page, pages]);

  // ── TOC headings filtered to h2/h3 ────────────────────────────────────
  const tocHeadings = useMemo(() => {
    if (!page) return [];
    return page.headings.filter((h) => h.depth >= 2 && h.depth <= 3);
  }, [page]);

  // ── Heading click → copy link ─────────────────────────────────────────
  const copyHeadingLink = useCallback(
    async (headingSlug: string) => {
      const url = `${window.location.origin}/kb/${kb}/${page?.slug}#${headingSlug}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(headingSlug);
        setTimeout(() => setCopiedId(null), 1500);
      } catch {
        // Fallback: select a temporary input
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopiedId(headingSlug);
        setTimeout(() => setCopiedId(null), 1500);
      }
    },
    [kb, page],
  );

  // ── After render: attach heading ids, click handlers, and scroll-spy ──
  useEffect(() => {
    if (!contentRef.current || !page) return;
    const container = contentRef.current;

    // Assign ids to heading elements and register for scroll spy + click-to-copy
    const map = new Map<string, HTMLElement>();
    const headingElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headingElements.forEach((el) => {
      const text = el.textContent?.trim() ?? '';
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      el.id = el.id || slug;
      map.set(el.id, el as HTMLElement);

      // Attach click handler on the heading for copy-link
      if (!el.hasAttribute('data-link-hooked')) {
        el.setAttribute('data-link-hooked', 'true');
        el.classList.add('heading-linkable');
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          copyHeadingLink(el.id);
        });
      }
    });

    headingRefs.current = map;

    // IntersectionObserver for scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [html, page, copyHeadingLink]);

  // ── Intercept wiki-link clicks inside the rendered content ────────────
  useEffect(() => {
    if (!contentRef.current) return;
    const container = contentRef.current;

    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const target = anchor.getAttribute('data-wiki-target');
      if (target && allSlugs.has(target)) {
        e.preventDefault();
        onNavigate(target);
      }
      // Also intercept heading-hash links for SPA navigation
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('#') && !anchor.hasAttribute('data-wiki-target')) {
        e.preventDefault();
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    container.addEventListener('click', handler);
    return () => container.removeEventListener('click', handler);
  }, [onNavigate, allSlugs]);

  // ── Empty state ────────────────────────────────────────────────────────
  if (!page) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md px-6 py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to the Knowledge Base</h2>
          <p className="text-muted-foreground leading-relaxed">
            Select a page from the sidebar to start reading.
            <br />
            You can also press{' '}
            <kbd className="px-1.5 py-0.5 rounded text-xs bg-muted border border-border font-mono">
              Ctrl+K
            </kbd>{' '}
            to search across all pages.
          </p>
        </div>
      </div>
    );
  }

  const hasToc = tocHeadings.length > 0;
  const hasTags = page.tags.length > 0;
  const hasBacklinks = backlinks.length > 0;

  return (
    <div className="relative flex h-full">
      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto" ref={contentRef}>
        <article className="max-w-3xl mx-auto px-8 py-10">
          {/* Header: title + metadata */}
          <header className="mb-8">
            {/* Title row */}
            <div className="flex items-start gap-3 mb-3">
              <h1 className="text-3xl font-bold tracking-tight flex-1">
                {page.title}
              </h1>

              {/* Star button */}
              <button
                onClick={onToggleFavorite}
                className={`mt-1.5 w-8 h-8 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                  isFavorite
                    ? 'text-amber-500 hover:text-amber-600 bg-amber-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className="w-5 h-5"
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {/* Tags badges */}
            {hasTags && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {page.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Updated date */}
            {page.updated && (
              <p className="text-xs text-muted-foreground">
                Updated: {new Date(page.updated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </header>

          {/* ── Rendered markdown content ─────────────────────────────── */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none
              prose-headings:scroll-mt-20 prose-headings:cursor-pointer
              prose-headings:group prose-headings:relative
              prose-h1:text-2xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-4
              prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2
              prose-p:leading-relaxed prose-p:my-3
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-code:text-sm prose-code:rounded prose-code:px-1.5 prose-code:py-0.5
              prose-pre:rounded-lg prose-pre:border prose-pre:border-border
              prose-img:rounded-lg prose-img:shadow-md
              prose-li:my-1
              prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
              [&_.heading-linkable]:after:content-['#'] [&_.heading-linkable]:after:ml-2
              [&_.heading-linkable]:after:text-muted-foreground/0
              [&_.heading-linkable:hover]:after:text-muted-foreground/50
              [&_.heading-linkable]:after:text-sm [&_.heading-linkable]:after:transition-colors"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Footer: separation line */}
          <hr className="my-10 border-border" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Hash className="w-3.5 h-3.5" />
            <span>{page.slug}</span>
            {page.sources && page.sources.length > 0 && (
              <>
                <span>·</span>
                <span>
                  {page.sources.length} source{page.sources.length !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>

          {/* ── Backlinks ──────────────────────────────────────────────── */}
          {hasBacklinks && (
            <section className="mt-12">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Backlinks ({backlinks.length})
              </h2>
              <div className="space-y-2">
                {backlinks.map((bl) => (
                  <button
                    key={bl.source}
                    onClick={() => onNavigate(bl.source)}
                    className="block w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors group"
                  >
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">
                      {bl.title}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5 font-mono">
                      {bl.source}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>

      {/* ── TOC sidebar (sticky, right) ────────────────────────────────── */}
      {hasToc && (
        <aside className="hidden xl:block w-56 shrink-0 border-l border-border bg-background overflow-auto sticky top-0 h-screen">
          <div className="px-4 py-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              On this page
            </h3>
            <nav className="space-y-0.5">
              {tocHeadings.map((h) => (
                <button
                  key={h.slug}
                  onClick={() => {
                    const el = headingRefs.current.get(h.slug);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      const fallback = document.getElementById(h.slug);
                      fallback?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors truncate ${
                    h.depth === 3 ? 'pl-5' : ''
                  } ${
                    activeHeading === h.slug
                      ? 'text-primary bg-accent font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                  title={h.text}
                >
                  {h.text}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* ── Copy feedback toast ────────────────────────────────────────── */}
      {copiedId && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border shadow-lg text-sm">
            <Link className="w-4 h-4 text-green-500" />
            <span>Link copied to clipboard</span>
          </div>
        </div>
      )}
    </div>
  );
}
