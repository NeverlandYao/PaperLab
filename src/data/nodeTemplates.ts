import { WorkflowEdge, WorkflowNode, WorkflowNodeType } from '../types/workflow';

type NodeTemplate = {
  label: string;
  description: string;
  order: number;
  config: Record<string, string | number>;
};

export const nodeTemplates: Record<WorkflowNodeType, NodeTemplate> = {
  input: {
    label: '文献输入',
    description: '输入研究主题和文献原文，作为流程起点。',
    order: 1,
    config: {
      topic: '人工智能在小学教育中的应用',
      documents:
        '文献A：人工智能可以支持个性化学习路径。\n文献B：教师数字素养会影响AI落地效果。\n文献C：城乡资源差异影响智能教学应用深度。',
    },
  },
  analysis: {
    label: '主题分析',
    description: '生成摘要并提取关键词。',
    order: 2,
    config: {
      keywordCount: 5,
      prompt: '请提炼研究主题、主要发现与关键词。',
    },
  },
  outline: {
    label: '提纲生成',
    description: '根据分析结果生成论文提纲。',
    order: 3,
    config: {
      level: 3,
      paperType: '教研论文',
      prompt: '请生成适合基础教育研究汇报的论文提纲。',
    },
  },
};

let nodeSequence = 0;

export function createNodeFromType(type: WorkflowNodeType, position: { x: number; y: number }): WorkflowNode {
  nodeSequence += 1;
  const template = nodeTemplates[type];

  return {
    id: `${type}-${nodeSequence}`,
    type,
    position,
    data: {
      label: template.label,
      description: template.description,
      config: { ...template.config },
      selected: false,
      status: 'idle',
    },
  };
}

export function createStarterWorkflow(): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  const nodes = [
    createNodeFromType('input', { x: 80, y: 120 }),
    createNodeFromType('analysis', { x: 420, y: 120 }),
    createNodeFromType('outline', { x: 760, y: 120 }),
  ];

  const edges: WorkflowEdge[] = [
    {
      id: 'edge-input-analysis',
      source: nodes[0].id,
      target: nodes[1].id,
    },
    {
      id: 'edge-analysis-outline',
      source: nodes[1].id,
      target: nodes[2].id,
    },
  ];

  return { nodes, edges };
}
