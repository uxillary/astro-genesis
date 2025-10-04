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
    <div className="relative overflow-hidden rounded-[28px] border border-[#d6e3e0]/10 bg-panel/70 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-[#d6e3e0]/10 bg-[#0b0d0f]/40 px-5 py-3 text-[0.58rem] font-mono uppercase tracking-[0.32em] text-dim">
        <span>Branch Map // Narrative Threads</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded-full border px-3 py-1 ${layout === 'layered' ? 'border-amber/70 text-amber' : 'border-[#d6e3e0]/20 text-dim hover:text-[#d6e3e0]'}`}
            onClick={() => setLayout('layered')}
          >
            Layered
          </button>
          <button
            type="button"
            className={`rounded-full border px-3 py-1 ${layout === 'radial' ? 'border-amber/70 text-amber' : 'border-[#d6e3e0]/20 text-dim hover:text-[#d6e3e0]'}`}
            onClick={() => setLayout('radial')}
          >
            Radial
          </button>
        </div>
      </div>
      <div className="h-[360px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
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
        >
          <MiniMap maskColor="rgba(11,13,15,0.85)" nodeColor={() => 'rgba(255,59,59,0.45)'} />
          <Background color="rgba(214,227,224,0.08)" gap={16} />
          <Controls showInteractive={false} className="!bg-[#0b0d0f]/70 !border-[#d6e3e0]/10 !text-[#d6e3e0]" />
        </ReactFlow>
      </div>
    </div>
  );
};

const createNodes = (title: string, activeSection: BranchKey, layout: 'layered' | 'radial'): Node[] => {
  const baseStyle = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${active ? 'rgba(0,179,255,0.75)' : 'rgba(214,227,224,0.18)'}`,
    borderRadius: 18,
    padding: '10px 14px',
    fontSize: 11,
    letterSpacing: '0.26em',
    textTransform: 'uppercase',
    background: active ? 'rgba(16,22,29,0.92)' : 'rgba(11,15,19,0.7)',
    color: active ? 'var(--amber)' : 'var(--mid)',
    boxShadow: active ? '0 0 24px rgba(0,179,255,0.3)' : '0 0 12px rgba(0,0,0,0.35)',
    backdropFilter: 'blur(6px)',
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
        border: '1px solid rgba(255,59,59,0.65)',
        borderRadius: 22,
        padding: '14px 20px',
        background: 'rgba(16,22,29,0.92)',
        color: 'var(--white)',
        fontSize: 13,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        boxShadow: '0 0 32px rgba(255,59,59,0.25)',
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
  const stroke = layout === 'radial' ? 'rgba(255,59,59,0.7)' : 'rgba(0,179,255,0.7)';
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
  style: {
    stroke,
    strokeWidth: 1.5,
    strokeDasharray: '6 6'
  },
  className: 'animated-edge'
});

const isBranch = (id: string): id is BranchKey =>
  id === 'abstract' || id === 'methods' || id === 'results' || id === 'conclusion';

export default BranchMap;
