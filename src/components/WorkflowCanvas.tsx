import {
  Search,
  BarChart3,
  PenTool,
  Download,
  Play,
  RotateCcw,
  Settings2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function WorkflowCanvas() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  return (
    <div className="w-full h-full canvas-grid relative flex items-center justify-center">
      <svg className="absolute inset-0 pointer-events-none w-full h-full">
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          d="M 300 300 C 450 300, 450 450, 600 450"
          className="stroke-primary stroke-2 fill-none stroke-dasharray-[4]"
        />
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
          d="M 600 450 C 750 450, 750 350, 900 350"
          className="stroke-primary stroke-2 fill-none stroke-dasharray-[4]"
        />
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="absolute left-[300px] top-[300px] -translate-x-1/2 -translate-y-1/2 w-48 glass-node p-4 rounded-xl shadow-2xl shadow-primary/10 border-tertiary/20 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-tertiary/10 rounded-lg text-tertiary">
            <Search size={18} />
          </div>
          <span className="font-headline font-bold text-sm text-primary">文献检索</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-outline">
            <span>来源</span>
            <span>12 个活动</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1 overflow-hidden">
            <div className="bg-tertiary h-full w-[70%] rounded-full" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute left-[600px] top-[450px] -translate-x-1/2 -translate-y-1/2 w-56 glass-node p-5 rounded-xl shadow-2xl shadow-primary/15 border-secondary/30 ring-2 ring-primary ring-offset-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-secondary/10 rounded-lg text-secondary">
              <BarChart3 size={20} />
            </div>
            <span className="font-headline font-bold text-base text-primary">数据综合</span>
          </div>
          <Settings2
            size={16}
            className="text-primary cursor-pointer hover:rotate-90 transition-transform"
            onClick={() => setIsDrawerOpen(true)}
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-full uppercase">定性</span>
          <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[9px] font-bold rounded-full uppercase">聚类</span>
        </div>
        <div className="text-[11px] text-outline leading-relaxed italic">
          正在分析 452 个唯引证节点以确保本体一致性...
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute left-[900px] top-[350px] -translate-x-1/2 -translate-y-1/2 w-52 glass-node p-4 rounded-xl shadow-2xl shadow-primary/10 border-primary/20"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <PenTool size={18} />
          </div>
          <span className="font-headline font-bold text-sm text-primary">写作引擎</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-surface-container rounded" />
          <div className="h-2 w-3/4 bg-surface-container rounded" />
          <div className="h-2 w-5/6 bg-surface-container rounded" />
        </div>
      </motion.div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-white/90 backdrop-blur-2xl rounded-full shadow-2xl shadow-primary/20 border border-outline-variant/20 z-40">
        <button className="group flex items-center gap-2 text-outline hover:text-red-600 transition-colors">
          <RotateCcw size={20} className="group-active:rotate-180 transition-transform duration-500" />
          <span className="text-sm font-bold font-headline">清空画布</span>
        </button>
        <div className="w-[1px] h-6 bg-outline-variant/30" />
        <div className="flex items-center gap-4">
          <button className="px-6 py-2.5 rounded-full bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2">
            <Download size={18} />
            导出设计
          </button>
          <button className="px-8 py-2.5 rounded-full signature-gradient text-white font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-95 transition-all flex items-center gap-2 group">
            <Play size={18} className="fill-current" />
            运行工作流
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white/90 backdrop-blur-2xl border-l border-outline-variant/10 shadow-2xl p-6 overflow-y-auto z-50"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-secondary">
                  <Settings2 size={24} />
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-primary">节点配置</h3>
                  <p className="text-[10px] text-outline uppercase tracking-wider">配置 AI 参数</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-surface-container rounded-full transition-colors text-outline"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-4">分析深度</label>
                <input
                  type="range"
                  className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-2 text-[10px] text-outline font-medium">
                  <span>启发式</span>
                  <span>深度神经</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-4">数据阈值</label>
                <div className="space-y-2">
                  {[
                    { label: '仅限同行评审', active: true },
                    { label: '包含预印本', active: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                      <span className="text-xs font-medium">{item.label}</span>
                      <div
                        className={cn(
                          'w-8 h-4 rounded-full relative transition-colors cursor-pointer',
                          item.active ? 'bg-secondary' : 'bg-outline-variant',
                        )}
                      >
                        <div
                          className={cn(
                            'absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all',
                            item.active ? 'right-0.5' : 'left-0.5',
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-4">输出格式</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Markdown', 'BibTeX', 'PDF 手稿', 'JSON-LD'].map((format, i) => (
                    <button
                      key={format}
                      className={cn(
                        'p-3 text-xs font-bold rounded-xl transition-all',
                        i === 0
                          ? 'bg-white border border-primary text-primary shadow-sm'
                          : 'bg-surface-container-low text-outline hover:bg-surface-container-high',
                      )}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-outline-variant/20">
              <button className="w-full py-3 flex items-center justify-center gap-2 text-outline hover:text-primary transition-colors text-xs font-medium">
                <RotateCcw size={16} />
                恢复默认
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
