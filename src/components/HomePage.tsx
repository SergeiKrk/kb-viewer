import type { KBMeta } from '../types';
import { BookOpen, FileText, GitBranch, Calendar, ArrowRight } from 'lucide-react';

interface Props {
  kbList: KBMeta[];
}

export default function HomePage({ kbList }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">KB Viewer</h1>
              <p className="text-xs text-muted-foreground">Базы знаний Karpathy-style</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Мои базы знаний</h2>
          <p className="text-muted-foreground">
            {kbList.length} {plural(kbList.length, 'база', 'базы', 'баз')} · построены по принципам LLM Wiki
          </p>
        </div>

        {kbList.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg text-muted-foreground">Базы знаний не найдены</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Добавьте папку с wiki/ в директорию knowledge/
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kbList.map(kb => (
              <a
                key={kb.path}
                href={`/kb/${kb.path}`}
                className="group block p-6 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {kb.name}
                </h3>

                {kb.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {kb.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {kb.pageCount} {plural(kb.pageCount, 'страница', 'страницы', 'страниц')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5" />
                    {kb.linkCount} связей
                  </span>
                  {kb.lastModified && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(kb.lastModified)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  {kb.hasLog && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Log
                    </span>
                  )}
                  {kb.hasIndex && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      Index
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
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

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

import ThemeToggle from './ThemeToggle';
