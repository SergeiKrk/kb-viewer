import { useState, useMemo, useCallback, useRef } from 'react';
import type { KBPage, GraphNode, GraphEdge } from '../types';

interface Props {
  kb: string;
  pages: KBPage[];
  onNavigate: (slug: string) => void;
}

// Distinct palette for group coloring
const GROUP_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#e11d48', // rose
  '#7c3aed', // purple
  '#84cc16', // lime
  '#64748b', // slate
  '#d946ef', // fuchsia
  '#0ea5e9', // sky
];

const NODE_RADIUS = 18;
const GRID_CELL_W = 130;
const GRID_CELL_H = 100;
const GRID_MARGIN = 40;
const LABEL_OFFSET = 22;

/** Extract the directory group from a page path */
function getGroup(path: string): string {
  // path like "folder/sub/file.md" — group is dirname
  const lastSlash = path.lastIndexOf('/');
  if (lastSlash <= 0) return '(root)';
  return path.slice(0, lastSlash);
}

/** Build nodes and edges from pages */
function buildGraph(pages: KBPage[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
  slugToId: Map<string, string>;
} {
  const slugSet = new Set(pages.map(p => p.slug));
  const slugToId = new Map<string, string>();
  const nodes: GraphNode[] = [];

  for (const page of pages) {
    const group = getGroup(page.path);
    const id = page.slug;
    slugToId.set(page.slug, id);
    nodes.push({
      id,
      label: page.title || page.slug,
      kb: '',
      group,
      linkCount: page.links.length,
    });
  }

  // Build edges — only include links where the target is a known page
  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];
  for (const page of pages) {
    for (const link of page.links) {
      if (!slugSet.has(link.target)) continue;
      const key = [page.slug, link.target].sort().join('::');
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push({ source: page.slug, target: link.target });
    }
  }

  return { nodes, edges, slugToId };
}

/** Lay out nodes in a grid grouped by directory */
function layoutGrid(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Map<string, { x: number; y: number; color: string }> {
  const positions = new Map<string, { x: number; y: number; color: string }>();

  // Group nodes by their group field
  const groups = new Map<string, GraphNode[]>();
  for (const node of nodes) {
    const list = groups.get(node.group) || [];
    list.push(node);
    groups.set(node.group, list);
  }

  const groupNames = [...groups.keys()].sort();
  const COLS = 6;
  let yOffset = GRID_MARGIN;

  for (let gi = 0; gi < groupNames.length; gi++) {
    const groupName = groupNames[gi];
    const groupNodes = groups.get(groupName)!;
    const color = GROUP_COLORS[gi % GROUP_COLORS.length];

    for (let i = 0; i < groupNodes.length; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = GRID_MARGIN + col * GRID_CELL_W + GRID_CELL_W / 2;
      const y = yOffset + row * GRID_CELL_H + GRID_CELL_H / 2;
      positions.set(groupNodes[i].id, { x, y, color });
    }

    const rowsForGroup = Math.ceil(groupNodes.length / COLS);
    yOffset += rowsForGroup * GRID_CELL_H + GRID_MARGIN / 2;
  }

  return positions;
}

export default function GraphView({ kb: _kb, pages, onNavigate }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1200, h: 800 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; vbX: number; vbY: number } | null>(null);

  const { nodes, edges, slugToId } = useMemo(() => buildGraph(pages), [pages]);
  const positions = useMemo(() => layoutGrid(nodes, edges), [nodes, edges]);

  // Compute SVG bounds
  const svgBounds = useMemo(() => {
    let maxX = 0;
    let maxY = 0;
    for (const pos of positions.values()) {
      maxX = Math.max(maxX, pos.x + NODE_RADIUS + LABEL_OFFSET);
      maxY = Math.max(maxY, pos.y + NODE_RADIUS + LABEL_OFFSET + 10);
    }
    return { w: maxX + GRID_MARGIN, h: maxY + GRID_MARGIN };
  }, [positions]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, vbX: viewBox.x, vbY: viewBox.y };
    e.preventDefault();
  }, [viewBox]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    // Scale movement to viewBox coordinates
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const newX = dragStart.current.vbX - dx * scaleX;
    const newY = dragStart.current.vbY - dy * scaleY;
    setViewBox(vb => ({ ...vb, x: newX, y: newY }));
  }, [dragging, viewBox]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  // Zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const el = svgRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Current mouse position in viewBox coords
    const vbMouseX = viewBox.x + (mouseX / rect.width) * viewBox.w;
    const vbMouseY = viewBox.y + (mouseY / rect.height) * viewBox.h;

    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
    const newW = Math.max(200, Math.min(10000, viewBox.w * zoomFactor));
    const newH = Math.max(200, Math.min(10000, viewBox.h * zoomFactor));

    // Adjust x,y so mouse stays on same viewBox point
    const newX = vbMouseX - (mouseX / rect.width) * newW;
    const newY = vbMouseY - (mouseY / rect.height) * newH;

    setViewBox({ x: newX, y: newY, w: newW, h: newH });
  }, [viewBox]);

  const handleNodeClick = useCallback((slug: string) => {
    onNavigate(slug);
  }, [onNavigate]);

  if (pages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No pages to display in graph.
      </div>
    );
  }

  return (
    <div
      className="h-full w-full overflow-hidden cursor-grab"
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="select-none"
      >
        {/* Background */}
        <rect
          x={viewBox.x - 10000}
          y={viewBox.y - 10000}
          width={20000}
          height={20000}
          fill="transparent"
        />

        {/* Edges */}
        <g>
          {edges.map(edge => {
            const src = positions.get(edge.source);
            const tgt = positions.get(edge.target);
            if (!src || !tgt) return null;
            return (
              <line
                key={`${edge.source}::${edge.target}`}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke="var(--border-color, #334155)"
                strokeWidth={1}
                opacity={0.5}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map(node => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node.id);
                }}
              >
                {/* Hover ring (invisible, grows on hover via CSS if desired) */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS + 4}
                  fill="transparent"
                  className="transition-all duration-150"
                />
                {/* Main node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS}
                  fill={pos.color}
                  stroke={pos.color}
                  strokeWidth={1.5}
                  opacity={0.9}
                  className="hover:opacity-100 transition-opacity"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                />
                {/* Link count badge for highly-connected nodes */}
                {node.linkCount > 0 && (
                  <circle
                    cx={pos.x + NODE_RADIUS * 0.7}
                    cy={pos.y - NODE_RADIUS * 0.7}
                    r={9}
                    fill="var(--card-bg, #1e293b)"
                    stroke={pos.color}
                    strokeWidth={1}
                    opacity={0.95}
                  />
                )}
                {node.linkCount > 0 && (
                  <text
                    x={pos.x + NODE_RADIUS * 0.7}
                    y={pos.y - NODE_RADIUS * 0.7}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--foreground, #e2e8f0)"
                    fontSize={9}
                    fontWeight={600}
                  >
                    {node.linkCount > 99 ? '99+' : node.linkCount}
                  </text>
                )}
                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + LABEL_OFFSET}
                  textAnchor="middle"
                  fill="var(--foreground, #e2e8f0)"
                  fontSize={10}
                  fontWeight={500}
                  className="pointer-events-none"
                  style={{ textShadow: '0 1px 3px var(--bg, #0f172a)' }}
                >
                  {node.label.length > 20
                    ? node.label.slice(0, 19) + '…'
                    : node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom controls overlay */}
      <div className="absolute bottom-4 right-4 flex gap-1">
        <button
          onClick={() => setViewBox(vb => ({ ...vb, w: vb.w * 1.3, h: vb.h * 1.3 }))}
          className="w-8 h-8 rounded-md bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors text-sm"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setViewBox(vb => ({ ...vb, w: vb.w * 0.7, h: vb.h * 0.7 }))}
          className="w-8 h-8 rounded-md bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors text-sm"
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => setViewBox({ x: 0, y: 0, w: svgBounds.w, h: svgBounds.h })}
          className="w-8 h-8 rounded-md bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors text-sm"
          title="Fit to screen"
        >
          ⊡
        </button>
      </div>
    </div>
  );
}
