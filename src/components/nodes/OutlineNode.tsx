import { NodeProps } from '@xyflow/react';
import { ListTree } from 'lucide-react';
import NodeCard from './NodeCard';
import { WorkflowNode } from '../../types/workflow';

export default function OutlineNode({ data }: NodeProps<WorkflowNode>) {
  return <NodeCard data={data} accentClassName="bg-emerald-700" icon={ListTree} />;
}
