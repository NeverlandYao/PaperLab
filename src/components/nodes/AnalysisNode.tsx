import { NodeProps } from '@xyflow/react';
import { FileText } from 'lucide-react';
import NodeCard from './NodeCard';
import { WorkflowNode } from '../../types/workflow';

export default function AnalysisNode({ data }: NodeProps<WorkflowNode>) {
  return <NodeCard data={data} accentClassName="bg-cyan-700" icon={FileText} />;
}
