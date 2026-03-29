import { Edge, Node } from '@xyflow/react';

export type WorkflowNodeType = 'input' | 'analysis' | 'outline';
export type WorkflowNodeStatus = 'idle' | 'running' | 'success' | 'error';

export interface WorkflowNodeData {
  [key: string]: unknown;
  label: string;
  description: string;
  config: Record<string, string | number>;
  selected: boolean;
  status: WorkflowNodeStatus;
}

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;

export interface RunResult {
  summary: string;
  keywords: string[];
  outline: string;
}
