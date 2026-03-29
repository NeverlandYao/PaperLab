import { 
  ArrowRight, 
  Rocket, 
  PlusCircle, 
  Library,
  Search,
  BarChart3,
  GitBranch,
  PenTool,
  Languages
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function ResourceCenter() {
  return (
    <div className="p-12 min-h-full overflow-y-auto scroll-smooth">
      {/* Header */}
      <header className="mb-16 max-w-6xl">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline text-5xl font-extrabold text-primary mb-4 tracking-tighter"
        >
          教研资源中心
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-sans text-lg text-on-surface-variant max-w-2xl leading-relaxed"
        >
          您的活跃调查项目和专业 AI 配置的精选库。管理、启动并优化您的学术工作流。
        </motion.p>
      </header>

      {/* Active Projects */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-2xl font-bold text-on-surface">活跃研究项目</h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">04 活跃</span>
          </div>
          <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1 group">
            查看所有项目 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {[
            { 
              title: '农村教育影响研究', 
              desc: '对中西部低人口密度中心数字工具效能的纵向分析。', 
              status: '分析节点运行中', 
              statusColor: 'bg-secondary-container text-secondary',
              img: 'https://picsum.photos/seed/rural/600/400'
            },
            { 
              title: 'STEM 课程 2.0', 
              desc: '利用 AI 综合分析中学物理教育的多学科方法。', 
              status: '检索节点运行中', 
              statusColor: 'bg-tertiary/10 text-tertiary',
              img: 'https://picsum.photos/seed/stem/600/400'
            },
          ].map((project, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-xl shadow-on-surface/5 border border-outline-variant/15 hover:border-primary/30 transition-all group"
            >
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={project.img} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", project.statusColor)}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-headline text-xl font-bold mb-2 text-primary">{project.title}</h3>
                <p className="font-sans text-sm text-on-surface-variant mb-6 line-clamp-2">{project.desc}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2].map(n => (
                      <div key={n} className="w-6 h-6 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">
                        {n === 1 ? 'JD' : 'MK'}
                      </div>
                    ))}
                  </div>
                  <button className="signature-gradient text-white px-6 py-2 rounded-xl text-sm font-bold shadow-sm hover:translate-y-[-1px] active:translate-y-[1px] transition-all">
                    启动
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* New Project Placeholder */}
          <div className="border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center p-8 text-center hover:bg-surface-container-low transition-colors group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <PlusCircle size={24} className="text-outline group-hover:text-primary" />
            </div>
            <h3 className="font-headline font-bold text-on-surface-variant">发起新调查</h3>
            <p className="text-xs text-outline mt-1">配置包含自定义 AI 智能体的新工作区</p>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface">我的智能体模板</h2>
          <span className="bg-secondary/10 text-secondary text-xs font-bold px-2 py-1 rounded-full">共 08 个</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { title: '文献综述大师', desc: '系统扫描 PubMed、JSTOR 和 ArXiv，创建带有主题聚类的注释书目。', icon: Library, color: 'bg-secondary/10 text-secondary' },
            { title: '调查数据分析师', desc: '读取原始 CSV 数据，识别统计异常值并自动生成交叉表报告。', icon: BarChart3, color: 'bg-tertiary/10 text-tertiary' },
            { title: '假设起草助手', desc: '利用逻辑基础和同行评审模拟逻辑协助完善研究问题。', icon: GitBranch, color: 'bg-primary/10 text-primary' },
            { title: '全球资源翻译官', desc: '翻译并总结非英语学术资源，同时保持技术术语的精确性。', icon: Languages, color: 'bg-secondary-container/30 text-secondary' },
          ].map((template, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-xl shadow-on-surface/5 flex flex-col border border-transparent hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", template.color)}>
                  <template.icon size={20} />
                </div>
                <h4 className="font-headline font-bold text-on-surface leading-tight">{template.title}</h4>
              </div>
              <p className="font-sans text-xs text-on-surface-variant mb-6 leading-relaxed">{template.desc}</p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="w-2 h-2 rounded-full bg-primary/30" />
                </div>
                <button className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  立即启动 <Rocket size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
