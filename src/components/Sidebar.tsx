import type { DragEvent } from 'react';
import { FileInput, FileText, ListTree } from 'lucide-react';
import { nodeTemplates } from '../data/nodeTemplates';
import { WorkflowNodeType } from '../types/workflow';

const iconMap = {
  input: FileInput,
  analysis: FileText,
  outline: ListTree,
};

export default function Sidebar() {
  const handleDragStart = (event: DragEvent<HTMLButtonElement>, nodeType: WorkflowNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="border-r border-slate-200 bg-white p-5">
      <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">节点库</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">将三个节点拖入画布，并按固定顺序连线。</p>

      <div className="mt-6 space-y-3">
        {(Object.keys(nodeTemplates) as WorkflowNodeType[]).map((type) => {
          const template = nodeTemplates[type];
          const Icon = iconMap[type];

          return (
            <button
              key={type}
              type="button"
              draggable
              onDragStart={(event) => handleDragStart(event, type)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 text-cyan-700 shadow-sm">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{template.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{template.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl bg-slate-900 p-4 text-slate-100">
        <p className="text-sm font-semibold">合法链路</p>
        <p className="mt-2 text-xs leading-5 text-slate-300">文献输入 → 主题分析 → 提纲生成</p>
      </div>
    </aside>
  );
}
