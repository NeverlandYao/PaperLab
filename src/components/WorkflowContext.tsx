import { EdgeChange, NodeChange, applyEdgeChanges, useEdgesState, useNodesState } from '@xyflow/react';
import { createContext, useContext, useMemo, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createNodeFromType, createStarterWorkflow } from '../data/nodeTemplates';
import { RunResult, WorkflowEdge, WorkflowNode, WorkflowNodeType } from '../types/workflow';
import { runWorkflowRequest } from '../utils/runWorkflow';
import { validateWorkflow } from '../utils/validateWorkflow';

type WorkflowContextValue = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  setEdges: Dispatch<SetStateAction<WorkflowEdge[]>>;
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;
  selectedNode: WorkflowNode | null;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeConfig: (nodeId: string, key: string, value: string | number) => void;
  addNodeFromType: (type: WorkflowNodeType, position: { x: number; y: number }) => void;
  clearWorkflow: () => void;
  resetDemoWorkflow: () => void;
  runWorkflow: () => Promise<void>;
  result: RunResult | null;
  error: string | null;
  setError: (message: string | null) => void;
  isRunning: boolean;
};

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const starter = useMemo(() => createStarterWorkflow(), []);
  const [nodes, setNodes, baseOnNodesChange] = useNodesState<WorkflowNode>(starter.nodes);
  const [edges, setEdges] = useEdgesState<WorkflowEdge>(starter.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(starter.nodes[0]?.id ?? null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const onNodesChange = (changes: NodeChange<WorkflowNode>[]) => {
    baseOnNodesChange(changes);
  };

  const onEdgesChange = (changes: EdgeChange<WorkflowEdge>[]) => {
    setEdges((current) => applyEdgeChanges(changes, current));
  };

  const updateNodeConfig = (nodeId: string, key: string, value: string | number) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  [key]: value,
                },
              },
            }
          : node,
      ),
    );
  };

  const addNodeFromType = (type: WorkflowNodeType, position: { x: number; y: number }) => {
    const newNode = createNodeFromType(type, position);
    setNodes((current) => [...current, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const clearWorkflow = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setResult(null);
    setError(null);
  };

  const resetDemoWorkflow = () => {
    const next = createStarterWorkflow();
    setNodes(next.nodes);
    setEdges(next.edges);
    setSelectedNodeId(next.nodes[0]?.id ?? null);
    setResult(null);
    setError(null);
  };

  const updateStatuses = (status: WorkflowNode['data']['status']) => {
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        data: {
          ...node.data,
          selected: node.id === selectedNodeId,
          status,
        },
      })),
    );
  };

  const runWorkflow = async () => {
    const validation = validateWorkflow(nodes, edges);
    if (!validation.valid) {
      setError(validation.message);
      setResult(null);
      updateStatuses('error');
      return;
    }

    setError(null);
    setResult(null);
    setIsRunning(true);
    updateStatuses('running');

    try {
      const response = await runWorkflowRequest(nodes, edges);
      setResult(response);
      updateStatuses('success');
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : '流程运行失败。');
      updateStatuses('error');
    } finally {
      setIsRunning(false);
    }
  };

  const value = {
    nodes: nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        selected: node.id === selectedNodeId,
      },
    })),
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    updateNodeConfig,
    addNodeFromType,
    clearWorkflow,
    resetDemoWorkflow,
    runWorkflow,
    result,
    error,
    setError,
    isRunning,
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
}
