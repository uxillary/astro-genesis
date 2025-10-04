import { useMemo, type CSSProperties } from 'react';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

type BranchMapProps = {
  title: string;
  activeSection: keyof BranchSections;
  onSectionChange: (key: keyof BranchSections) => void;
};

type BranchSections = {
  abstract: string;
  methods: string;
  results: string;
  conclusion: string;
};

const BranchMap = ({ title, activeSection, onSectionChange }: BranchMapProps) => {
  const nodes = useMemo<Node[]>(() => {
    return [
      {
        id: 'root',
        data: { label: title },
        position: { x: 0, y: 0 },
        type: 'input',
        style: {
          border: '1px solid rgba(85, 230, 165, 0.7)',
          padding: '12px 16px',
          borderRadius: 12,
          background: 'rgba(7,10,18,0.95)',
          color: '#55e6a5',
          fontSize: 14,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          boxShadow: '0 0 16px rgba(85,230,165,0.35)'
        }
      },
      {
        id: 'abstract',
        data: { label: 'Abstract' },
        position: { x: -220, y: 140 },
        style: baseNodeStyle(activeSection === 'abstract')
      },
      {
        id: 'methods',
        data: { label: 'Methods' },
        position: { x: 220, y: 140 },
        style: baseNodeStyle(activeSection === 'methods')
      },
      {
        id: 'results',
        data: { label: 'Results' },
        position: { x: -220, y: -160 },
        style: baseNodeStyle(activeSection === 'results')
      },
      {
        id: 'conclusion',
        data: { label: 'Conclusion' },
        position: { x: 220, y: -160 },
        style: baseNodeStyle(activeSection === 'conclusion')
      }
    ];
  }, [activeSection, title]);

  const edges = useMemo<Edge[]>(() => {
    const accent = 'rgba(85, 230, 165, 0.6)';
    return [
      { id: 'e-root-abstract', source: 'root', target: 'abstract', animated: true, style: { stroke: accent, strokeWidth: 2 } },
      { id: 'e-root-methods', source: 'root', target: 'methods', animated: true, style: { stroke: accent, strokeWidth: 2 } },
      { id: 'e-root-results', source: 'root', target: 'results', animated: true, style: { stroke: accent, strokeWidth: 2 } },
      { id: 'e-root-conclusion', source: 'root', target: 'conclusion', animated: true, style: { stroke: accent, strokeWidth: 2 } }
    ];
  }, []);

  return (
    <div className="h-[360px] rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        onNodeClick={(_, node) => {
          if (node.id !== 'root' && isBranch(node.id)) {
            onSectionChange(node.id);
          }
        }}
        panOnDrag={false}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(85,230,165,0.15)" size={1} />
        <Controls showInteractive={false} className="!bg-black/60 !border-white/10" />
      </ReactFlow>
    </div>
  );
};

const baseNodeStyle = (active: boolean): CSSProperties => ({
  border: `1px solid ${active ? 'rgba(85,230,165,0.9)' : 'rgba(255,255,255,0.25)'}`,
  borderRadius: 12,
  padding: '8px 12px',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  background: active ? 'rgba(7,12,18,0.9)' : 'rgba(7,10,16,0.75)',
  color: active ? '#55e6a5' : 'rgba(226,232,240,0.8)',
  boxShadow: active ? '0 0 18px rgba(85,230,165,0.4)' : '0 0 8px rgba(15,112,104,0.4)',
  cursor: 'pointer'
});

const isBranch = (id: string): id is keyof BranchSections =>
  id === 'abstract' || id === 'methods' || id === 'results' || id === 'conclusion';

export default BranchMap;
