import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Target,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface GraphNode {
  id: string;
  name: string;
  category: string;
  level: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED';
  domain: string;
  currentProficiency: number;
  requiredProficiency: number;
  gapSize: number;
  importance: string;
  status: 'MASTERED' | 'DEVELOPING' | 'GAP' | 'LOCKED';
  isPrerequisiteMet: boolean;
  prerequisiteCount: number;
  recommendation?: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

interface SkillGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectSkill?: (node: GraphNode) => void;
  roleTitle?: string;
}

export default function SkillGraph({ nodes = [], edges = [], onSelectSkill, roleTitle }: SkillGraphProps) {
  const navigate = useNavigate();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'GAP' | 'MASTERED' | 'DEVELOPING'>('ALL');
  const [activeDomain, setActiveDomain] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract unique domains for filtering
  const domains = useMemo(() => {
    const list = Array.from(new Set(nodes.map(n => n.domain || 'Core'))).filter(Boolean);
    return ['ALL', ...list];
  }, [nodes]);

  // Layout calculations: Group nodes by level into columns
  const positionedNodes = useMemo(() => {
    if (!nodes.length) return [];

    const levelColumns: Record<string, GraphNode[]> = {
      FOUNDATIONAL: [],
      INTERMEDIATE: [],
      ADVANCED: []
    };

    nodes.forEach(node => {
      const lvl = node.level || 'FOUNDATIONAL';
      if (levelColumns[lvl]) {
        levelColumns[lvl].push(node);
      } else {
        levelColumns.FOUNDATIONAL.push(node);
      }
    });

    const colX: Record<string, number> = {
      FOUNDATIONAL: 160,
      INTERMEDIATE: 460,
      ADVANCED: 760
    };

    const width = 940;
    const height = 480;

    const result: (GraphNode & { x: number; y: number })[] = [];

    Object.entries(levelColumns).forEach(([lvl, columnNodes]) => {
      const count = columnNodes.length;
      if (count === 0) return;
      const x = colX[lvl] || 460;
      const spacing = height / (count + 1);

      columnNodes.forEach((node, idx) => {
        const y = spacing * (idx + 1);
        result.push({
          ...node,
          x,
          y
        });
      });
    });

    return result;
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode & { x: number; y: number }>();
    positionedNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [positionedNodes]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return positionedNodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, positionedNodes]);

  const filteredNodes = useMemo(() => {
    return positionedNodes.filter(n => {
      const matchStatus = activeFilter === 'ALL' || n.status === activeFilter;
      const matchDomain = activeDomain === 'ALL' || n.domain === activeDomain;
      return matchStatus && matchDomain;
    });
  }, [positionedNodes, activeFilter, activeDomain]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const getNodeColor = (status: GraphNode['status']) => {
    switch (status) {
      case 'MASTERED':
        return {
          bg: 'bg-emerald-600',
          border: 'border-emerald-400',
          glow: 'rgba(16, 185, 129, 0.3)',
          badge: 'bg-emerald-100 text-emerald-800',
          ring: 'ring-emerald-400'
        };
      case 'GAP':
        return {
          bg: 'bg-rose-500',
          border: 'border-rose-400',
          glow: 'rgba(244, 63, 94, 0.4)',
          badge: 'bg-rose-100 text-rose-800',
          ring: 'ring-rose-400'
        };
      case 'LOCKED':
        return {
          bg: 'bg-stone-500',
          border: 'border-stone-400',
          glow: 'rgba(120, 113, 108, 0.2)',
          badge: 'bg-stone-100 text-stone-700',
          ring: 'ring-stone-400'
        };
      case 'DEVELOPING':
      default:
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-400',
          glow: 'rgba(245, 158, 11, 0.3)',
          badge: 'bg-amber-100 text-amber-800',
          ring: 'ring-amber-400'
        };
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNodeId(node.id);
    if (onSelectSkill) onSelectSkill(node);
  };

  return (
    <div className="relative bg-white rounded-3xl border border-sage/30 shadow-sm p-6 lg:p-8 flex flex-col space-y-6 overflow-hidden">
      
      {/* Graph Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-sage/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-forest">Interactive Skill Graph</h3>
            {roleTitle && (
              <span className="text-xs font-bold text-forest bg-sage/20 px-2.5 py-1 rounded-full">
                {roleTitle}
              </span>
            )}
          </div>
          <p className="text-sm text-muted font-medium mt-1">
            Visual dependency tree tracking skill prerequisites, verified proficiencies, and targeted gaps.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'GAP', 'DEVELOPING', 'MASTERED'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-forest text-cream shadow-sm scale-105'
                  : 'bg-cream text-muted hover:text-forest hover:bg-sage/20'
              }`}
            >
              {filter === 'ALL' && 'All Skills'}
              {filter === 'GAP' && 'Gaps to Close'}
              {filter === 'DEVELOPING' && 'In Progress'}
              {filter === 'MASTERED' && 'Mastered'}
            </button>
          ))}

          {/* Domain Dropdown */}
          <select
            value={activeDomain}
            onChange={(e) => setActiveDomain(e.target.value)}
            className="bg-cream border border-sage/40 text-forest font-bold text-xs rounded-xl px-3 py-1.5 outline-none hover:border-forest transition"
          >
            {domains.map(d => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Domains' : d}
              </option>
            ))}
          </select>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-cream rounded-xl p-1 border border-sage/30">
            <button
              onClick={() => setZoomLevel(z => Math.max(0.7, z - 0.1))}
              className="p-1 text-muted hover:text-forest transition"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-[11px] font-bold text-forest px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(1.4, z + 0.1))}
              className="p-1 text-muted hover:text-forest transition"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-muted hover:text-forest transition"
              title="Reset Zoom"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div 
        ref={containerRef}
        className="relative bg-gradient-to-b from-[#F9FAF9] to-[#F3F6F4] rounded-2xl border border-sage/30 h-[480px] overflow-hidden flex items-center justify-center"
      >
        {/* Column Background Guides */}
        <div className="absolute inset-0 grid grid-cols-3 pointer-events-none opacity-40">
          <div className="border-r border-dashed border-sage/40 flex items-start justify-center pt-3">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-muted/80">Foundational</span>
          </div>
          <div className="border-r border-dashed border-sage/40 flex items-start justify-center pt-3">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-muted/80">Intermediate</span>
          </div>
          <div className="flex items-start justify-center pt-3">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-muted/80">Advanced</span>
          </div>
        </div>

        {/* Scaled Graph Surface */}
        <div 
          className="relative w-[960px] h-[480px] transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* SVG Dependency Arrows */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <marker
                id="graph-arrow"
                viewBox="0 0 10 10"
                refX="26"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#8FB8AA" />
              </marker>
              <marker
                id="graph-arrow-active"
                viewBox="0 0 10 10"
                refX="26"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#123F36" />
              </marker>
            </defs>

            {edges.map((edge, idx) => {
              const source = nodeMap.get(edge.from);
              const target = nodeMap.get(edge.to);
              if (!source || !target) return null;

              const isConnectedToSelected = selectedNodeId === edge.from || selectedNodeId === edge.to;
              const isDimmed = selectedNodeId && !isConnectedToSelected;

              // Cubic bezier curve path between source and target
              const dx = target.x - source.x;
              const control1X = source.x + dx * 0.5;
              const control1Y = source.y;
              const control2X = source.x + dx * 0.5;
              const control2Y = target.y;

              const pathData = `M ${source.x} ${source.y} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${target.x} ${target.y}`;

              return (
                <path
                  key={`${edge.from}-${edge.to}-${idx}`}
                  d={pathData}
                  fill="none"
                  stroke={isConnectedToSelected ? '#123F36' : '#8FB8AA'}
                  strokeWidth={isConnectedToSelected ? 3 : 1.8}
                  strokeDasharray={isConnectedToSelected ? undefined : '4 3'}
                  opacity={isDimmed ? 0.2 : 0.85}
                  markerEnd={isConnectedToSelected ? 'url(#graph-arrow-active)' : 'url(#graph-arrow)'}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Render Graph Nodes */}
          {positionedNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isVisible = filteredNodeIds.has(node.id);
            const isDimmed = !isVisible || (selectedNodeId && !isSelected && !edges.some(e => 
              (e.from === selectedNodeId && e.to === node.id) || (e.to === selectedNodeId && e.from === node.id)
            ));

            const colors = getNodeColor(node.status);

            return (
              <motion.div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: isSelected ? 1.15 : 1, 
                  opacity: isDimmed ? 0.25 : 1 
                }}
                transition={{ duration: 0.2 }}
                style={{ 
                  left: `${node.x}px`, 
                  top: `${node.y}px`, 
                  zIndex: isSelected ? 20 : 10 
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group`}
              >
                {/* Outer Glow Halo for selected or gap nodes */}
                <div 
                  className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 bg-white shadow-md transition-all duration-300 ${
                    isSelected 
                      ? `${colors.ring} ring-4 shadow-xl border-forest` 
                      : `${colors.border} hover:shadow-lg hover:scale-105`
                  }`}
                  style={{
                    boxShadow: isSelected ? `0 10px 25px -5px ${colors.glow}` : undefined
                  }}
                >
                  {/* Status Indicator Icon */}
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 ${colors.bg}`}>
                    {node.status === 'MASTERED' && <CheckCircle2 size={15} strokeWidth={2.5} />}
                    {node.status === 'GAP' && <AlertCircle size={15} strokeWidth={2.5} />}
                    {node.status === 'LOCKED' && <Lock size={14} strokeWidth={2.5} />}
                    {node.status === 'DEVELOPING' && <Sparkles size={14} strokeWidth={2.5} />}
                  </div>

                  {/* Node Label & Level */}
                  <div className="text-left min-w-[70px]">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-ink leading-tight">{node.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-muted">
                        {node.currentProficiency}%
                      </span>
                      <span className="text-[10px] text-muted/60">/</span>
                      <span className="text-[10px] font-semibold text-forest-dark">
                        {node.requiredProficiency}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Pill */}
                  <div className="w-1.5 h-7 rounded-full bg-cream overflow-hidden flex flex-col-reverse shrink-0">
                    <div 
                      className={`w-full ${colors.bg} rounded-full transition-all duration-500`}
                      style={{ height: `${Math.min(100, Math.round((node.currentProficiency / node.requiredProficiency) * 100))}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Node Details Drawer */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-sage/50 z-30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${getNodeColor(selectedNode.status).bg}`}>
                  {selectedNode.status === 'MASTERED' && <CheckCircle2 size={24} />}
                  {selectedNode.status === 'GAP' && <AlertCircle size={24} />}
                  {selectedNode.status === 'LOCKED' && <Lock size={22} />}
                  {selectedNode.status === 'DEVELOPING' && <Sparkles size={22} />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-black text-forest">{selectedNode.name}</h4>
                    <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full ${getNodeColor(selectedNode.status).badge}`}>
                      {selectedNode.status === 'GAP' ? 'High Priority Gap' : selectedNode.status}
                    </span>
                    <span className="text-[11px] font-bold text-muted bg-cream px-2 py-0.5 rounded-full border border-sage/30">
                      {selectedNode.domain} &bull; {selectedNode.level}
                    </span>
                  </div>

                  <p className="text-xs text-forest-dark/80 mt-1 max-w-2xl font-medium">
                    {selectedNode.recommendation || `Target level is ${selectedNode.requiredProficiency}%. Close this skill gap to boost market readiness.`}
                  </p>
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-sage/20">
                <div className="text-right">
                  <div className="text-xs font-bold text-muted uppercase tracking-wider">Gap Delta</div>
                  <div className="text-lg font-black text-forest">
                    {selectedNode.gapSize > 0 ? `-${selectedNode.gapSize}%` : 'Met ✓'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/learning')}
                    className="bg-forest hover:bg-forest-dark text-cream text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    Roadmap <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-xs font-bold text-muted hover:text-forest bg-cream px-3 py-2.5 rounded-xl transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Graph Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-muted pt-2 border-t border-sage/20">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
            <span>Mastered (Meets Target)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span>Developing (&lt; 25% Gap)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span>Critical Gap (&gt; 25% Gap)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-stone-500 inline-block"></span>
            <span>Prerequisites Pending</span>
          </div>
        </div>

        <span className="text-[11px] text-muted/80">
          Showing {filteredNodes.length} of {nodes.length} skills
        </span>
      </div>

    </div>
  );
}
