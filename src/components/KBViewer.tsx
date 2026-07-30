import { useState, useCallback, useEffect } from 'react';
import type { KBMeta, KBPage, TreeNode, LogEntry } from '../types';
import Sidebar from './Sidebar';
import ArticleView from './ArticleView';
import SearchDialog from './SearchDialog';
import GraphView from './GraphView';
import TimelineView from './TimelineView';
import Breadcrumbs from './Breadcrumbs';
import ThemeToggle from './ThemeToggle';
import {
  BookOpen, Search, GitGraph, Clock, Star,
  PanelLeftClose, PanelLeft, ArrowLeft, ArrowRight, Home
} from 'lucide-react';

interface Props {
  kb: string;
  meta: KBMeta;
  pages: KBPage[];
  tree: TreeNode[];
  logEntries: LogEntry[];
  initialPage: KBPage | null;
}

export default function KBViewer({ kb, meta, pages, tree, logEntries, initialPage }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<KBPage | null>(initialPage);
  const [searchOpen, setSearchOpen] = useState(false);
  const [view, setView] = useState<'article' | 'graph' | 'timeline'>('article');
  const [history, setHistory] = useState<string[]>(initialPage ? [initialPage.slug] : []);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`fav-${kb}`) || '[]');
    } catch { return []; }
  });
  const [sidebarWidth, setSidebarWidth] = useState(280);

  const navigateTo = useCallback((slug: string) => {
    const page = pages.find(p => p.slug === slug);
    if (page) {
      setCurrentPage(page);
      setView('article');
      const newHistory = [...history.slice(0, historyIdx + 1), slug];
      setHistory(newHistory);
      setHistoryIdx(newHistory.length - 1);
    }
  }, [pages, history, historyIdx]);

  const goBack = () => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      const page = pages.find(p => p.slug === history[newIdx]);
      if (page) setCurrentPage(page);
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      const page = pages.find(p => p.slug === history[newIdx]);
      if (page) setCurrentPage(page);
    }
  };

  const toggleFavorite = (slug: string) => {
    const next = favorites.includes(slug)
      ? favorites.filter(f => f !== slug)
      : [...favorites, slug];
    setFavorites(next);
    localStorage.setItem(`fav-${kb}`, JSON.stringify(next));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(s => !s);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isFavorite = currentPage ? favorites.includes(currentPage.slug) : false;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-border bg-background flex items-center px-4 gap-2 shrink-0 z-50">
        <a href="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors mr-2">
          <Home className="w-4 h-4" />
        </a>
        <Breadcrumbs slug={currentPage?.slug || ''} kb={kb} onNavigate={navigateTo} />

        <div className="flex-1" />

        <button onClick={goBack} disabled={historyIdx <= 0}
          className="w-7 h-7 rounded flex items-center justify-center hover:bg-accent disabled:opacity-30 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button onClick={goForward} disabled={historyIdx >= history.length - 1}
          className="w-7 h-7 rounded flex items-center justify-center hover:bg-accent disabled:opacity-30 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>

        <button onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1 text-xs rounded-md border border-border bg-muted/50 hover:bg-accent transition-colors min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Поиск...</span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border font-mono">Ctrl+K</kbd>
        </button>

        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => setView('article')}
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${view === 'article' ? 'bg-accent' : 'hover:bg-accent'}`}>
            <BookOpen className="w-4 h-4" />
          </button>
          <button onClick={() => setView('graph')}
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${view === 'graph' ? 'bg-accent' : 'hover:bg-accent'}`}>
            <GitGraph className="w-4 h-4" />
          </button>
          {logEntries.length > 0 && (
            <button onClick={() => setView('timeline')}
              className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${view === 'timeline' ? 'bg-accent' : 'hover:bg-accent'}`}>
              <Clock className="w-4 h-4" />
            </button>
          )}
        </div>

        <ThemeToggle />
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className="shrink-0 border-r border-border bg-background overflow-hidden transition-all duration-200"
          style={{ width: sidebarOpen ? sidebarWidth : 0 }}
        >
          {sidebarOpen && (
            <Sidebar
              tree={tree}
              currentSlug={currentPage?.slug || ''}
              onNavigate={navigateTo}
              kb={kb}
              favorites={favorites}
            />
          )}
        </div>

        {/* Resize handle */}
        {sidebarOpen && (
          <div
            className="w-1 cursor-col-resize hover:bg-primary/20 transition-colors shrink-0"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startW = sidebarWidth;
              const onMove = (ev: MouseEvent) => {
                setSidebarWidth(Math.max(180, Math.min(500, startW + ev.clientX - startX)));
              };
              const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
              };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}
          />
        )}

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(s => !s)}
          className="absolute left-0 bottom-4 w-6 h-6 rounded-r-md bg-card border border-border border-l-0 flex items-center justify-center hover:bg-accent transition-colors z-10"
          style={{ left: sidebarOpen ? sidebarWidth - 1 : 0 }}
        >
          {sidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {view === 'article' && (
            <ArticleView
              page={currentPage}
              pages={pages}
              kb={kb}
              onNavigate={navigateTo}
              isFavorite={isFavorite}
              onToggleFavorite={() => currentPage && toggleFavorite(currentPage.slug)}
            />
          )}
          {view === 'graph' && (
            <GraphView kb={kb} pages={pages} onNavigate={navigateTo} />
          )}
          {view === 'timeline' && (
            <TimelineView entries={logEntries} />
          )}
        </main>
      </div>

      {/* Search dialog */}
      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        pages={pages}
        kb={kb}
        onNavigate={(slug) => { navigateTo(slug); setSearchOpen(false); }}
      />
    </div>
  );
}
