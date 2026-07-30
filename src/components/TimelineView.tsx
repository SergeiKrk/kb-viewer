import type { LogEntry } from '../types';
import { Clock } from 'lucide-react';

interface Props {
  entries: LogEntry[];
}

const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

const actionColors: Record<string, string> = {
  ingest: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
  query: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
  lint: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
  schema: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
  init: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700',
  source: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-700',
  create: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700',
};

const dotColors: Record<string, string> = {
  ingest: 'bg-green-500 ring-green-200 dark:ring-green-800',
  query: 'bg-blue-500 ring-blue-200 dark:ring-blue-800',
  lint: 'bg-amber-500 ring-amber-200 dark:ring-amber-800',
  schema: 'bg-purple-500 ring-purple-200 dark:ring-purple-800',
  init: 'bg-gray-500 ring-gray-200 dark:ring-gray-800',
  source: 'bg-cyan-500 ring-cyan-200 dark:ring-cyan-800',
  create: 'bg-indigo-500 ring-indigo-200 dark:ring-indigo-800',
};

const lineColors: Record<string, string> = {
  ingest: 'bg-green-300 dark:bg-green-700',
  query: 'bg-blue-300 dark:bg-blue-700',
  lint: 'bg-amber-300 dark:bg-amber-700',
  schema: 'bg-purple-300 dark:bg-purple-700',
  init: 'bg-gray-300 dark:bg-gray-700',
  source: 'bg-cyan-300 dark:bg-cyan-700',
  create: 'bg-indigo-300 dark:bg-indigo-700',
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    // If it's a full ISO timestamp, include time
    if (dateStr.includes('T')) {
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function TimelineView({ entries }: Props) {
  // Sort newest first (reverse chronological)
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
        <Clock className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">No log entries yet</p>
        <p className="text-sm mt-1">Activity will appear here as actions are performed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-xl font-semibold mb-8">Activity Timeline</h2>
      <div className="relative">
        {sorted.map((entry, i) => {
          const actionLower = entry.action.toLowerCase();
          const isLast = i === sorted.length - 1;

          return (
            <div key={`${entry.date}-${entry.action}-${i}`} className="flex gap-4 pb-6 group">
              {/* Date column */}
              <div className="w-32 shrink-0 pt-0.5 text-right">
                <time
                  dateTime={entry.date}
                  className="text-xs text-muted-foreground leading-tight block"
                >
                  {formatDate(entry.date)}
                </time>
              </div>

              {/* Dot + line column */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={cn(
                    'w-3.5 h-3.5 rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform group-hover:scale-125',
                    dotColors[actionLower] || 'bg-gray-400 ring-gray-200 dark:ring-gray-800'
                  )}
                />
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 mt-1',
                      lineColors[actionLower] || 'bg-gray-300 dark:bg-gray-700'
                    )}
                  />
                )}
              </div>

              {/* Content column */}
              <div className="flex-1 min-w-0 pt-0.5">
                <span
                  className={cn(
                    'inline-block text-xs font-medium px-2 py-0.5 rounded-full border',
                    actionColors[actionLower] ||
                      'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
                  )}
                >
                  {entry.action}
                </span>
                <p className="text-sm mt-1.5 text-foreground leading-relaxed">
                  {entry.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
