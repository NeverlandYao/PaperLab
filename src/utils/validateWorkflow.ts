import { WorkflowEdge, WorkflowNode } from '../types/workflow';

export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const inputNode = nodes.find((node) => node.type === 'input');
  const analysisNode = nodes.find((node) => node.type === 'analysis');
  const outlineNode = nodes.find((node) => node.type === 'outline');

  if (!inputNode || !analysisNode || !outlineNode) {
    return {
      valid: false,
      message: '工作流必须包含“文献输入、主题分析、提纲生成”三个节点。',
    };
  }

  const inputToAnalysis = edges.some((edge) => edge.source === inputNode.id && edge.target === analysisNode.id);
  const analysisToOutline = edges.some((edge) => edge.source === analysisNode.id && edge.target === outlineNode.id);

  if (!inputToAnalysis || !analysisToOutline) {
    return {
      valid: false,
      message: '请按“文献输入 → 主题分析 → 提纲生成”的顺序连线。',
    };
  }

  if (!String(inputNode.data.config.topic ?? '').trim() || !String(inputNode.data.config.documents ?? '').trim()) {
    return {
      valid: false,
      message: '请在“文献输入”节点中填写研究主题和文献文本。',
    };
  }

  return { valid: true, message: 'ok' };
}
