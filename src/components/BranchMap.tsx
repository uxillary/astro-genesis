import { useMemo, type CSSProperties } from 'react';
import ReactFlow, { Background, Controls, Edge, MiniMap, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { useUiStore } from '../lib/state';

export type BranchKey = keyof BranchSections;

type BranchMapProps = {
  title: string;
  activeSection: BranchKey;
  onSectionChange: (key: BranchKey) => void;
};

type BranchSections = {
  abstract: string;
  methods: string;
  results: string;
  conclusion: string;
};

const BranchMap = ({ title, activeSection, onSectionChange }: BranchMapProps) => {
  const layout = useUiStore((state) => state.branchLayout);
  const setLayout = useUiStore((state) => state.setBranchLayout);

  const nodes = useMemo<Node[]>(() => createNodes(title, activeSection, layout), [title, activeSection, layout]);
  const edges = useMemo<Edge[]>(() => createEdges(layout), [layout]);

  return (
    <div className="branch-map-shell">
      <div className="branch-map-head absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-[#d6e3e0]/15 bg-[#0b0d0f]/60 px-5 py-3 text-[0.58rem] font-mono uppercase tracking-[0.32em] text-white/70">
        <span>Branch Map // Narrative Threads</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded-full border px-3 py-1 transition-colors ${
              layout === 'layered'
                ? 'border-cyan/60 text-[color:var(--accent-2)] shadow-[0_0_18px_rgba(0,179,255,0.3)]'
                : 'border-[#d6e3e0]/20 text-white/60 hover:border-cyan/40 hover:text-white/80'
            }`}
            onClick={() => setLayout('layered')}
          >
            Layered
          </button>
          <button
            type="button"
            className={`rounded-full border px-3 py-1 transition-colors ${
              layout === 'radial'
                ? 'border-cyan/60 text-[color:var(--accent-2)] shadow-[0_0_18px_rgba(0,179,255,0.3)]'
                : 'border-[#d6e3e0]/20 text-white/60 hover:border-cyan/40 hover:text-white/80'
            }`}
            onClick={() => setLayout('radial')}
          >
            Radial
          </button>
        </div>
      </div>
      <div className="branch-map-grid h-[360px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnDrag={false}
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) => {
            if (node.id !== 'root' && isBranch(node.id)) {
              onSectionChange(node.id);
              window.location.hash = `#${node.id}`;
            }
          }}
          className="branch-map-flow"
        >
          <MiniMap
            maskColor="rgba(11,13,15,0.82)"
            nodeColor={() => 'rgba(0,179,255,0.55)'}
            nodeStrokeColor={() => 'rgba(0,179,255,0.55)'}
          />
          <Background color="rgba(85,230,165,0.18)" gap={28} size={1} />
          <Controls showInteractive={false} className="!bg-[#0b0d0f]/80 !border-[#d6e3e0]/18 !text-[#d6e3e0]" />
        </ReactFlow>
      </div>
      <div className="branch-map-vignette" aria-hidden="true" />
    </div>
  );
};

const createNodes = (title: string, activeSection: BranchKey, layout: 'layered' | 'radial'): Node[] => {
  const baseStyle = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${active ? 'rgba(0,179,255,0.9)' : 'rgba(214,227,224,0.22)'}`,
    borderRadius: 18,
    padding: '12px 16px',
    fontSize: 11,
    letterSpacing: '0.26em',
    textTransform: 'uppercase',
    background: active ? 'linear-gradient(180deg, rgba(14,22,30,0.95), rgba(10,14,20,0.7))' : 'rgba(11,15,19,0.65)',
    color: active ? 'rgba(244,252,251,0.95)' : 'rgba(214,227,224,0.78)',
    boxShadow: active
      ? '0 0 28px rgba(0,179,255,0.35), inset 0 0 16px rgba(0,179,255,0.25)'
      : '0 0 18px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer'
  });

  const positions = layout === 'radial' ? radialPositions : layeredPositions;

  return [
    {
      id: 'root',
      data: { label: title },
      position: positions.root,
      draggable: false,
      type: 'default',
      style: {
        border: '1px solid rgba(255,59,59,0.55)',
        borderRadius: 22,
        padding: '16px 22px',
        background: 'linear-gradient(180deg, rgba(16,22,29,0.96), rgba(10,14,20,0.75))',
        color: 'rgba(244,252,251,0.98)',
        fontSize: 13,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        boxShadow: '0 0 38px rgba(255,59,59,0.35)',
        textAlign: 'center',
        maxWidth: 280
      }
    },
    {
      id: 'abstract',
      data: { label: 'Abstract' },
      position: positions.abstract,
      style: baseStyle(activeSection === 'abstract')
    },
    {
      id: 'methods',
      data: { label: 'Methods' },
      position: positions.methods,
      style: baseStyle(activeSection === 'methods')
    },
    {
      id: 'results',
      data: { label: 'Results' },
      position: positions.results,
      style: baseStyle(activeSection === 'results')
    },
    {
      id: 'conclusion',
      data: { label: 'Conclusion' },
      position: positions.conclusion,
      style: baseStyle(activeSection === 'conclusion')
    }
  ];
};

const layeredPositions = {
  root: { x: 0, y: 0 },
  abstract: { x: -240, y: 160 },
  methods: { x: 240, y: 160 },
  results: { x: -240, y: -160 },
  conclusion: { x: 240, y: -160 }
};

const radialPositions = {
  root: { x: 0, y: 0 },
  abstract: { x: 0, y: 220 },
  methods: { x: 220, y: 0 },
  results: { x: 0, y: -220 },
  conclusion: { x: -220, y: 0 }
};

const createEdges = (layout: 'layered' | 'radial'): Edge[] => {
  const stroke = layout === 'radial' ? 'rgba(255,86,86,0.7)' : 'rgba(0,179,255,0.75)';
  return [
    edge('root', 'abstract', stroke),
    edge('root', 'methods', stroke),
    edge('root', 'results', stroke),
    edge('root', 'conclusion', stroke)
  ];
};

const edge = (source: string, target: string, stroke: string): Edge => ({
  id: `e-${source}-${target}`,
  source,
  target,
  animated: true,
  type: 'smoothstep',
  style: {
    stroke,
    strokeWidth: 2,
    strokeLinecap: 'round',
    filter: 'drop-shadow(0 0 12px rgba(0,179,255,0.35))'
  },
  className: 'branch-map-edge'
});

const isBranch = (id: string): id is BranchKey =>
  id === 'abstract' || id === 'methods' || id === 'results' || id === 'conclusion';

export default BranchMap;
