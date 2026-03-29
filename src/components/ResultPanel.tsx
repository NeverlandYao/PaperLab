import { CheckCircle2, CircleDashed } from 'lucide-react';
import { useWorkflow } from './WorkflowContext';

export default function ResultPanel() {
  const { result, error } = useWorkflow();

  return (
    <section className="border-t border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        {result ? <CheckCircle2 size={18} className="text-emerald-600" /> : <CircleDashed size={18} className="text-slate-400" />}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">结果面板</h2>
          <p className="mt-1 text-sm text-slate-600">展示摘要、关键词和提纲生成结果。</p>
        </div>
      </div>

      {!result && !error && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">点击顶部“运行测试”后，这里会显示流程结果。</div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}

      {result && (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">文献摘要</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{result.summary}</p>
          </article>
          <article className="rounded-2xl bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">关键词</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800">
                  {keyword}
                </span>
              ))}
            </div>
          </article>
          <article className="rounded-2xl bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">论文提纲</h3>
            <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{result.outline}</pre>
          </article>
        </div>
      )}
    </section>
  );
}
