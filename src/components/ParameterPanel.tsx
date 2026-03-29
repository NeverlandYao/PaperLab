import { AlertCircle, SlidersHorizontal } from 'lucide-react';
import { useWorkflow } from './WorkflowContext';

export default function ParameterPanel() {
  const { selectedNode, updateNodeConfig, error } = useWorkflow();

  return (
    <aside className="overflow-y-auto bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-cyan-700">
          <SlidersHorizontal size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">参数面板</h2>
          <p className="mt-1 text-sm text-slate-600">点击节点后在这里配置参数。</p>
        </div>
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-6">{error}</p>
        </div>
      )}

      {!selectedNode && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
          请选择一个节点查看并编辑参数。
        </div>
      )}

      {selectedNode && (
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-lg font-semibold text-slate-900">{selectedNode.data.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{selectedNode.data.description}</p>
          </div>

          {selectedNode.type === 'input' && (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">研究主题</span>
                <input
                  value={String(selectedNode.data.config.topic ?? '')}
                  onChange={(event) => updateNodeConfig(selectedNode.id, 'topic', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">文献文本</span>
                <textarea
                  value={String(selectedNode.data.config.documents ?? '')}
                  onChange={(event) => updateNodeConfig(selectedNode.id, 'documents', event.target.value)}
                  rows={10}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none ring-cyan-200 transition focus:ring"
                />
              </label>
            </>
          )}

          {selectedNode.type === 'analysis' && (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">关键词数量</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={Number(selectedNode.data.config.keywordCount ?? 5)}
                  onChange={(event) => updateNodeConfig(selectedNode.id, 'keywordCount', Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">分析提示词</span>
                <textarea
                  value={String(selectedNode.data.config.prompt ?? '')}
                  onChange={(event) => updateNodeConfig(selectedNode.id, 'prompt', event.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none ring-cyan-200 transition focus:ring"
                />
              </label>
            </>
          )}

          {selectedNode.type === 'outline' && (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">提纲层级</span>
                <input
                  type="number"
                  min={2}
                  max={5}
                  value={Number(selectedNode.data.config.level ?? 3)}
                  onChange={(event) => updateNodeConfig(selectedNode.id, 'level', Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">论文类型</span>
                <input
                  value={String(selectedNode.data.config.paperType ?? '')}
                  onChange={(event) => updateNodeConfig(selectedNode.id, 'paperType', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">生成提示词</span>
                <textarea
                  value={String(selectedNode.data.config.prompt ?? '')}
                  onChange={(event) => updateNodeConfig(selectedNode.id, 'prompt', event.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none ring-cyan-200 transition focus:ring"
                />
              </label>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
