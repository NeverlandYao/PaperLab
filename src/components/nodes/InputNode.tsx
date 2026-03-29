import { NodeProps } from '@xyflow/react';
import { FileInput } from 'lucide-react';
import NodeCard from './NodeCard';
import { WorkflowNode } from '../../types/workflow';

export default function InputNode({ data }: NodeProps<WorkflowNode>) {
  return <NodeCard data={data} accentClassName="bg-slate-900" icon={FileInput} />;
}
