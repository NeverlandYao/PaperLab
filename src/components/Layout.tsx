import React from 'react';
import { 
  LayoutGrid, 
  FileText, 
  Library, 
  Bell, 
  Settings, 
  PlusCircle, 
  HelpCircle, 
  Archive,
  Search,
  BarChart3,
  GitBranch,
  PenTool,
  Rocket
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'workflow' | 'editor' | 'resources';
  setActiveTab: (tab: 'workflow' | 'editor' | 'resources') => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 flex items-center justify-between px-6 border-b border-outline-variant/10">
        <div className="flex items-center gap-12">
          <span className="text-xl font-extrabold text-primary font-headline tracking-tight">教研智筑</span>
          <nav className="flex items-center gap-8">
            {[
              { id: 'workflow', label: '工作流', icon: LayoutGrid },
              { id: 'editor', label: '编辑器', icon: FileText },
              { id: 'resources', label: '资源中心', icon: Library },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 font-headline font-bold tracking-tight py-1 transition-all relative",
                  activeTab === tab.id 
                    ? "text-primary" 
                    : "text-outline hover:text-primary-container"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-5 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {activeTab === 'editor' && (
            <div className="relative hidden lg:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input 
                type="text" 
                placeholder="搜索研究资料..." 
                className="bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-1.5 text-sm w-64 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          )}
          <button className="p-2 text-outline hover:bg-surface-container rounded-full transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 text-outline hover:bg-surface-container rounded-full transition-colors">
            <Settings size={20} />
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary-fixed ml-2">
            <img 
              src="https://picsum.photos/seed/researcher/100/100" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Side Navigation */}
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-surface-container-low/50 backdrop-blur-xl z-40 flex flex-col p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 bg-primary-container rounded-xl shadow-sm text-white">
            <Rocket size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary font-headline">智能体</h2>
            <p className="text-[10px] text-outline uppercase tracking-widest font-medium">拖拽至画布</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { label: '检索', icon: Search },
            { label: '分析', icon: BarChart3 },
            { label: '大纲', icon: GitBranch },
            { label: '写作', icon: PenTool },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 p-3 text-outline hover:bg-white hover:text-primary hover:shadow-sm rounded-xl transition-all group"
            >
              <item.icon size={18} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
          
          <div className="mt-8 mb-4">
            <span className="px-2 text-[10px] font-bold text-outline uppercase tracking-[0.2em]">模板</span>
          </div>
          
          <div className="space-y-2">
            {['文献检索', '框架生成', '数据处理器', '文本润色'].map((template) => (
              <button
                key={template}
                className="w-full p-3 bg-white/50 hover:bg-white rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-all text-left group"
              >
                <div className="text-xs font-semibold text-primary">{template}</div>
                <div className="text-[10px] text-outline">专业级学术智能体</div>
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-4">
          <button className="w-full py-3 signature-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <PlusCircle size={18} />
            新建工作流
          </button>
        </div>

        <div className="mt-auto flex border-t border-outline-variant/20 pt-4 gap-4">
          <button className="flex items-center gap-2 text-outline hover:text-primary transition-colors">
            <HelpCircle size={18} />
            <span className="text-xs font-medium">帮助</span>
          </button>
          <button className="flex items-center gap-2 text-outline hover:text-primary transition-colors">
            <Archive size={18} />
            <span className="text-xs font-medium">存档</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 mt-16 relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
