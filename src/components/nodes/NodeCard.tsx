import { Handle, Position } from '@xyflow/react';
import { LucideIcon } from 'lucide-react';
import { WorkflowNodeData } from '../../types/workflow';

interface NodeCardProps {
  data: WorkflowNodeData;
  accentClassName: string;
  icon: LucideIcon;
}

const statusClassName = {
  idle: 'bg-slate-200 text-slate-600',
  running: 'bg-blue-100 text-blue-700',
  success: 'bg-emerald-100 text-emerald-700',
  error: 'bg-rose-100 text-rose-700',
};

export default function NodeCard({ data, accentClassName, icon: Icon }: NodeCardProps) {
  return (
    <div className={`w-60 rounded-2xl border bg-white p-4 shadow-sm ${data.selected ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-slate-200'}`}>
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-slate-400" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2 text-white ${accentClassName}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{data.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{data.description}</p>
          </div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClassName[data.status]}`}>{data.status}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-cyan-700" />
    </div>
  );
}
