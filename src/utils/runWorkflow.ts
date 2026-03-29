import { RunResult, WorkflowEdge, WorkflowNode } from '../types/workflow';

export async function runWorkflowRequest(nodes: WorkflowNode[], edges: WorkflowEdge[]): Promise<RunResult> {
  const response = await fetch('http://localhost:8000/api/run-workflow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nodes, edges }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail ?? '后端运行失败。');
  }

  return response.json();
}
