import {
  addEdge,
  Background,
  Connection,
  Controls,
  MiniMap,
  OnConnect,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import { useCallback } from 'react';
import type { DragEvent } from 'react';
import { useWorkflow } from './WorkflowContext';
import { nodeTemplates } from '../data/nodeTemplates';
import { WorkflowNodeType } from '../types/workflow';
import InputNode from './nodes/InputNode';
import AnalysisNode from './nodes/AnalysisNode';
import OutlineNode from './nodes/OutlineNode';

const nodeTypes = {
  input: InputNode,
  analysis: AnalysisNode,
  outline: OutlineNode,
};

export default function FlowCanvas() {
  const {
    nodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    addNodeFromType,
    setSelectedNodeId,
    setError,
  } = useWorkflow();
  const { screenToFlowPosition } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) {
        return;
      }

      const sourceOrder = nodeTemplates[sourceNode.type as WorkflowNodeType].order;
      const targetOrder = nodeTemplates[targetNode.type as WorkflowNodeType].order;
      const isValidDirection = targetOrder === sourceOrder + 1;

      if (!isValidDirection) {
        setError('只允许按“文献输入 → 主题分析 → 提纲生成”的顺序连线。');
        return;
      }

      setError(null);
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            id: `${connection.source}-${connection.target}-${current.length + 1}`,
          },
          current,
        ),
      );
    },
    [nodes, setEdges, setError],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType;

      if (!type || !nodeTemplates[type]) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNodeFromType(type, position);
      setError(null);
    },
    [addNodeFromType, screenToFlowPosition, setError],
  );

  return (
    <div className="relative min-w-0 border-x border-slate-200 bg-slate-50" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={24} color="#d7dee7" />
        <MiniMap pannable zoomable />
        <Controls />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/90 px-8 py-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">从左侧拖入节点开始搭建工作流</p>
            <p className="mt-2 text-xs text-slate-500">支持拖拽、连线、参数配置和运行结果回显</p>
          </div>
        </div>
      )}
    </div>
  );
}
