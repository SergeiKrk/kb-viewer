import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { KBMeta, KBPage, Heading, WikiLink, TreeNode, LogEntry, KBConfig } from '../types';

const KNOWLEDGE_ROOT = path.resolve('knowledge');
const CONFIG_PATH = path.resolve('src/config/kb.json');

export function getKBConfigs(): KBConfig[] {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  }
  // Auto-discover: find directories with wiki/ subdirectory
  const dirs = fs.readdirSync(KNOWLEDGE_ROOT, { withFileTypes: true });
  return dirs
    .filter(d => d.isDirectory() && fs.existsSync(path.join(KNOWLEDGE_ROOT, d.name, 'wiki')))
    .map(d => ({
      path: d.name,
      name: d.name,
      description: '',
    }));
}

export function getKBList(): KBMeta[] {
  const configs = getKBConfigs();
  return configs.map(config => getKBMeta(config.path));
}

export function getKBMeta(kbPath: string): KBMeta {
  const fullPath = path.join(KNOWLEDGE_ROOT, kbPath);
  const wikiPath = path.join(fullPath, 'wiki');
  const agentsPath = path.join(fullPath, 'AGENTS.md');

  let description = '';
  if (fs.existsSync(agentsPath)) {
    const content = fs.readFileSync(agentsPath, 'utf-8');
    const match = content.match(/> (.+)/);
    if (match) description = match[1];
  }

  const pages = getAllPages(kbPath);
  const linkCount = pages.reduce((sum, p) => sum + p.links.length, 0);
  const logPath = path.join(wikiPath, 'log.md');
  const indexPath = path.join(wikiPath, 'index.md');

  let lastModified = '';
  for (const page of pages) {
    if (page.mtime > lastModified) lastModified = page.mtime;
    if (page.updated && page.updated > lastModified) lastModified = page.updated;
  }

  return {
    name: configs.find(c => c.path === kbPath)?.name || kbPath,
    description,
    path: kbPath,
    pageCount: pages.length,
    linkCount,
    lastModified,
    hasLog: fs.existsSync(logPath),
    hasIndex: fs.existsSync(indexPath),
  };
}

const configs = getKBConfigs();

export function getAllPages(kbPath: string): KBPage[] {
  const wikiPath = path.join(KNOWLEDGE_ROOT, kbPath, 'wiki');
  if (!fs.existsSync(wikiPath)) return [];

  const files = walkDir(wikiPath, '.md');
  return files.map(f => parsePage(kbPath, f)).filter(Boolean) as KBPage[];
}

export function getPage(kbPath: string, slug: string): KBPage | null {
  const pages = getAllPages(kbPath);
  return pages.find(p => p.slug === slug) || null;
}

export function getPageByPath(kbPath: string, filePath: string): KBPage | null {
  const fullPath = path.join(KNOWLEDGE_ROOT, kbPath, 'wiki', filePath);
  if (!fs.existsSync(fullPath)) return null;
  return parsePage(kbPath, filePath);
}

function parsePage(kbPath: string, relativePath: string): KBPage | null {
  const fullPath = path.join(KNOWLEDGE_ROOT, kbPath, 'wiki', relativePath);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);

  const slug = relativePath.replace(/\.md$/, '');
  const title = frontmatter.title || extractTitle(content) || path.basename(relativePath, '.md');
  const tags = frontmatter.tags || [];
  const updated = frontmatter.updated || '';
  const sources = frontmatter.sources || [];

  const headings = extractHeadings(content);
  const links = extractWikiLinks(content, slug, kbPath);

  const stat = fs.statSync(fullPath);

  return {
    slug,
    title,
    path: relativePath,
    content: renderMarkdown(content),
    rawContent: content,
    frontmatter,
    tags,
    updated,
    sources,
    headings,
    links,
    backlinks: [],
    mtime: stat.mtime.toISOString(),
  };
}

function extractTitle(content: string): string {
  const match = content.match(/^# (.+)$/m);
  return match ? match[1].trim() : '';
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const regex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push({
      depth: match[1].length,
      text: match[2].trim(),
      slug: slugify(match[2].trim()),
    });
  }
  return headings;
}

function extractWikiLinks(content: string, sourceSlug: string, kbPath: string): WikiLink[] {
  const links: WikiLink[] = [];
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const target = match[1].trim();
    const exists = fs.existsSync(path.join(KNOWLEDGE_ROOT, kbPath, 'wiki', `${target}.md`));
    links.push({
      target,
      title: target.split('/').pop() || target,
      exists,
      source: sourceSlug,
    });
  }
  return links;
}

function renderMarkdown(content: string): string {
  // Simple markdown-to-HTML. In production, use marked/shiki on the client
  return content
    .replace(/^### (.+)$/gm, '<h3 id="$1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 id="$1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 id="$1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[\[([^\]]+)\]\]/g, '<a href="/kb/$1" class="wiki-link">$1</a>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>');
}

export function getLogEntries(kbPath: string): LogEntry[] {
  const logPath = path.join(KNOWLEDGE_ROOT, kbPath, 'wiki', 'log.md');
  if (!fs.existsSync(logPath)) return [];

  const content = fs.readFileSync(logPath, 'utf-8');
  const entries: LogEntry[] = [];
  const regex = /## \[(\d{4}-\d{2}-\d{2})\]\s+(\w+)\s+\|\s+(.+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    entries.push({
      date: match[1],
      action: match[2],
      description: match[3],
    });
  }
  return entries;
}

export function getTree(kbPath: string): TreeNode[] {
  const wikiPath = path.join(KNOWLEDGE_ROOT, kbPath, 'wiki');
  if (!fs.existsSync(wikiPath)) return [];

  return buildTree(wikiPath, '');
}

function buildTree(dirPath: string, relativePath: string): TreeNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: TreeNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const children = buildTree(fullPath, relPath);
      nodes.push({
        name: entry.name,
        path: relPath,
        type: 'directory',
        children: children.length > 0 ? children : undefined,
      });
    } else if (entry.name.endsWith('.md')) {
      const slug = relPath.replace(/\.md$/, '');
      nodes.push({
        name: entry.name.replace(/\.md$/, ''),
        path: relPath,
        type: 'file',
        slug,
      });
    }
  }

  // Sort: directories first, then alphabetical
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

export function getBacklinks(kbPath: string, slug: string): WikiLink[] {
  const pages = getAllPages(kbPath);
  const backlinks: WikiLink[] = [];
  for (const page of pages) {
    for (const link of page.links) {
      if (link.target === slug) {
        backlinks.push({
          ...link,
          source: page.slug,
          title: page.title,
        });
      }
    }
  }
  return backlinks;
}

export function getGraphData(kbPath: string): { nodes: any[]; edges: any[] } {
  const pages = getAllPages(kbPath);
  const nodes: any[] = [];
  const edges: any[] = [];
  const seen = new Set<string>();

  for (const page of pages) {
    if (seen.has(page.slug)) continue;
    seen.add(page.slug);

    const parts = page.slug.split('/');
    const group = parts.length > 1 ? parts[0] : 'root';

    nodes.push({
      id: page.slug,
      label: page.title,
      group,
      linkCount: page.links.length + getBacklinks(kbPath, page.slug).length,
    });

    for (const link of page.links) {
      edges.push({
        source: page.slug,
        target: link.target,
      });
    }
  }

  return { nodes, edges };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function walkDir(dir: string, ext: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      files.push(path.relative(path.join(KNOWLEDGE_ROOT), fullPath).replace(/^[^/]+\/wiki\//, ''));
    }
  }
  return files;
}
