export interface KBMeta {
  name: string;
  description: string;
  path: string;
  pageCount: number;
  linkCount: number;
  lastModified: string;
  hasLog: boolean;
  hasIndex: boolean;
}

export interface KBPage {
  slug: string;
  title: string;
  path: string;
  content: string;
  rawContent: string;
  frontmatter: Record<string, any>;
  tags: string[];
  updated?: string;
  sources?: string[];
  headings: Heading[];
  links: WikiLink[];
  backlinks: WikiLink[];
  mtime: string;
}

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}

export interface WikiLink {
  target: string;
  title: string;
  exists: boolean;
  source: string;
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  slug?: string;
}

export interface SearchResult {
  slug: string;
  title: string;
  kb: string;
  preview: string;
  score: number;
  matchType: 'title' | 'content' | 'tag';
}

export interface GraphNode {
  id: string;
  label: string;
  kb: string;
  group: string;
  linkCount: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface LogEntry {
  date: string;
  action: string;
  description: string;
}

export interface KBConfig {
  path: string;
  name: string;
  description: string;
}
