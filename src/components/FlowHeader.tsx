import { LoaderCircle, Play, RotateCcw } from 'lucide-react';
import { useWorkflow } from './WorkflowContext';

export default function FlowHeader() {
  const { clearWorkflow, resetDemoWorkflow, runWorkflow, isRunning } = useWorkflow();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Design.md MVP</p>
        <h1 className="text-lg font-bold text-slate-900">教研论文智能体系统</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={resetDemoWorkflow}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          恢复示例
        </button>
        <button
          type="button"
          onClick={clearWorkflow}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <RotateCcw size={16} />
          清空画布
        </button>
        <button
          type="button"
          onClick={runWorkflow}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-cyan-400"
        >
          {isRunning ? <LoaderCircle size={16} className="animate-spin" /> : <Play size={16} />}
          {isRunning ? '运行中...' : '运行测试'}
        </button>
      </div>
    </header>
  );
}
