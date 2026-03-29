import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link2, 
  Image as ImageIcon,
  Sparkles,
  Lightbulb,
  Zap,
  MoreVertical,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Editor() {
  return (
    <div className="flex h-full bg-surface">
      {/* Editor Main Area */}
      <section className="flex-1 flex flex-col relative">
        {/* Toolbar */}
        <div className="h-14 border-b border-outline-variant/15 px-8 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-1">
            {[Bold, Italic, Underline].map((Icon, i) => (
              <button key={i} className="p-2 hover:bg-surface-container rounded-lg transition-colors text-outline">
                <Icon size={18} />
              </button>
            ))}
            <div className="w-px h-6 bg-outline-variant/30 mx-2" />
            {[List, ListOrdered].map((Icon, i) => (
              <button key={i} className="p-2 hover:bg-surface-container rounded-lg transition-colors text-outline">
                <Icon size={18} />
              </button>
            ))}
            <div className="w-px h-6 bg-outline-variant/30 mx-2" />
            {[Quote, Link2, ImageIcon].map((Icon, i) => (
              <button key={i} className="p-2 hover:bg-surface-container rounded-lg transition-colors text-outline">
                <Icon size={18} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-outline">1,248 字</span>
            <button className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
              导出
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-20 pb-40 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-on-surface mb-12 tracking-tight leading-tight font-headline">
              人工智能在小学教育中的应用：元分析研究
            </h1>
            <div className="space-y-8 text-lg leading-relaxed text-on-surface-variant font-sans">
              <p>
                将人工智能 (AI) 整合到小学教育环境中已从理论上的可能性转变为经验上的必要性。最近的元分析表明，自适应学习算法可以显著地为年幼的学习者提供个性化的教育体验，并实时调整难度级别和反馈。
              </p>
              <p>
                然而，这种技术的社会技术影响仍未得到充分审查。在认知发展处于关键阶段的小学教育语境下，人类教师与数字代理之间的界面必须进行周密的平衡。我们的研究探讨了生成式 AI 如何促进基于探究的学习，同时解决数据隐私和算法偏见的伦理约束。
              </p>
              <blockquote className="border-l-4 border-primary/20 pl-6 italic text-on-surface-variant/80 py-2">
                “主要目标不是取代教育者，而是利用数据驱动的洞察来增强教学工具箱，从而实现更有针对性的干预。”
              </blockquote>
              <p>
                纵向调查的定量结果显示，当 AI 工具作为脚手架式的支持而非直接指令使用时，参与度水平提高了 15%。这种区别对于未来的课程设计至关重要，它确保了技术充当通往基础读写和算术能力的桥梁，而非障碍。
              </p>
              <p>
                当我们检查来自 35 个不同学区的跨部门数据时，发现了一种不平等接入的模式。虽然城市中心利用高速连接进行实时 AI 处理，但农村机构往往在延迟方面挣扎——这是全球政策框架必须考虑的一个因素。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Sidebar */}
      <aside className="w-[35%] bg-surface-container-low border-l border-outline-variant/15 flex flex-col p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold font-headline text-primary">AI 助手</h2>
          <Sparkles size={20} className="text-primary fill-primary/20" />
        </div>

        {/* Smart Suggestion */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl p-5 rounded-xl border border-secondary/20 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-secondary" />
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">智能建议</span>
          </div>
          <p className="text-sm text-on-surface-variant mb-4 leading-snug">
            您的引言很有力，但如果能就“算法偏见”提出一个更具体的论点，效果会更好。
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 bg-secondary-container text-secondary text-xs rounded-full font-medium hover:opacity-80 transition-opacity">
              添加论点
            </button>
            <button className="px-3 py-1 bg-surface-container-highest text-outline text-xs rounded-full font-medium hover:opacity-80 transition-opacity">
              简化表述
            </button>
          </div>
        </motion.div>

        {/* Refine Action */}
        <div className="p-0.5 signature-gradient rounded-xl">
          <button className="w-full flex items-center justify-between px-5 py-4 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors rounded-[calc(0.75rem-2px)] group">
            <div className="text-left">
              <span className="block text-white font-bold text-sm">润色段落</span>
              <span className="block text-white/70 text-xs">提升学术语气与清晰度</span>
            </div>
            <Zap size={20} className="text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Citations */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-outline uppercase tracking-widest">引用管理器</h3>
            <button className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
              <Plus size={14} /> 添加来源
            </button>
          </div>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { author: 'Chen et al. (2023)', title: 'Adaptive Learning Systems in Early Childhood: A Survey of Global Implementations.', journal: 'Journal of Digital Pedagogy' },
              { author: 'UNESCO (2022)', title: 'Ethical Guidelines for AI in Education Frameworks.', journal: 'Policy Document' },
              { author: 'Rodriguez, M. (2024)', title: 'Cognitive Load Theory and Generative AI Interface Design.', journal: 'Tech & Learning Quarterly' },
            ].map((cite, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-primary">{cite.author}</span>
                  <MoreVertical size={14} className="text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2 italic mb-2">
                  "{cite.title}"
                </p>
                <div className="text-[10px] text-outline">{cite.journal}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="pt-4 border-t border-outline-variant/20">
          <div className="flex items-center justify-between text-xs text-outline mb-2">
            <span>阅读难度</span>
            <span className="text-on-surface font-semibold">研究生水平</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-primary w-[85%] h-full" />
          </div>
        </div>
      </aside>
    </div>
  );
}
