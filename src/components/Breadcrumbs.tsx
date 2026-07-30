import { Home, ChevronRight } from 'lucide-react';

interface Props {
  slug: string;
  kb: string;
  onNavigate: (slug: string) => void;
}

const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

export default function Breadcrumbs({ slug, kb: _kb, onNavigate }: Props) {
  const segments = slug ? slug.split('/').filter(Boolean) : [];

  // No segments — show just the Home icon (already at root)
  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-1 text-sm">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Home className="w-4 h-4" />
          <span>Home</span>
        </span>
      </div>
    );
  }

  // Build the visible breadcrumb items, applying truncation
  let visibleSegments: { label: string; slug: string; isEllipsis?: true }[];

  if (segments.length > 4) {
    // Show first, '...', then last 3
    visibleSegments = [
      { label: segments[0], slug: segments.slice(0, 1).join('/') },
      { label: '...', slug: '', isEllipsis: true as const },
      ...segments.slice(-3).map((seg, i) => ({
        label: seg,
        slug: segments.slice(0, segments.length - 3 + i + 1).join('/'),
      })),
    ];
  } else {
    visibleSegments = segments.map((seg, i) => ({
      label: seg,
      slug: segments.slice(0, i + 1).join('/'),
    }));
  }

  const lastIdx = visibleSegments.length - 1;

  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumbs">
      {/* Home icon — always clickable, navigates to KB root */}
      <button
        onClick={() => onNavigate('')}
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        title="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </button>

      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />

      {visibleSegments.map((item, idx) => {
        const isLast = idx === lastIdx;

        if (item.isEllipsis) {
          return (
            <span key={`ellipsis-${idx}`} className="flex items-center gap-1">
              <span className="text-muted-foreground px-1">…</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </span>
          );
        }

        if (isLast) {
          // Last segment — not clickable, just a label
          return (
            <span key={item.slug} className="text-foreground font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          );
        }

        // Clickable intermediate segment
        return (
          <span key={item.slug} className="flex items-center gap-1">
            <button
              onClick={() => onNavigate(item.slug)}
              className={cn(
                'text-muted-foreground hover:text-foreground hover:underline',
                'transition-colors truncate max-w-[200px]',
              )}
            >
              {item.label}
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </span>
        );
      })}
    </nav>
  );
}
