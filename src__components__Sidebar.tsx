import React from 'react';
import {
  LayoutDashboard,
  Bot,
  FileText,
  FileSpreadsheet,
  Mic,
  GitFork,
  HelpCircle,
  Layers,
  CalendarCheck,
  Bookmark,
  TrendingUp,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { DashboardTab } from '../types';

interface SidebarProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  savedCount?: number;
  tasksPendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  mobileMenuOpen,
  setMobileMenuOpen,
  savedCount = 2,
  tasksPendingCount = 3,
}) => {
  const navItems = [
    {
      id: 'home' as DashboardTab,
      label: 'الرئيسية',
      description: 'نظرة شاملة وسريعة',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'assistant' as DashboardTab,
      label: 'المساعد الدراسي الذكي',
      description: 'اسأل، ناقش، وتعمق',
      icon: Bot,
      badge: 'مباشر',
      highlight: true,
    },
    {
      id: 'summarizer' as DashboardTab,
      label: 'تلخيص المواد الدراسية',
      description: 'أفكار رئيسية وتعاريف',
      icon: FileText,
      badge: null,
    },
    {
      id: 'pdf_reader' as DashboardTab,
      label: 'قراءة وتحليل PDF',
      description: 'استخراج نصوص ومذاكرة',
      icon: FileSpreadsheet,
      badge: 'جديد',
    },
    {
      id: 'transcription' as DashboardTab,
      label: 'تفريغ المحاضرات',
      description: 'تحويل الصوت إلى نصوص',
      icon: Mic,
      badge: null,
    },
    {
      id: 'mindmaps' as DashboardTab,
      label: 'الخرائط الذهنية',
      description: 'تنظيم شجري تفاعلي',
      icon: GitFork,
      badge: null,
    },
    {
      id: 'quizzes' as DashboardTab,
      label: 'توليد الاختبارات',
      description: 'اختيار من متعدد وصح/خطأ',
      icon: HelpCircle,
      badge: null,
    },
    {
      id: 'flashcards' as DashboardTab,
      label: 'بطاقات الحفظ (Flashcards)',
      description: 'تكرار متباعد وتقليب 3D',
      icon: Layers,
      badge: null,
    },
    {
      id: 'planner' as DashboardTab,
      label: 'مخطط المذاكرة',
      description: 'مهام وجدول زمني ومؤقت',
      icon: CalendarCheck,
      badge: tasksPendingCount > 0 ? `${tasksPendingCount} مهام` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'saved' as DashboardTab,
      label: 'المذكرات والمحفوظات',
      description: 'مكتبتك المحلية',
      icon: Bookmark,
      badge: savedCount > 0 ? `${savedCount}` : null,
    },
    {
      id: 'progress' as DashboardTab,
      label: 'لوحة التقدم والإنجاز',
      description: 'إحصائيات وساعات المذاكرة',
      icon: TrendingUp,
      badge: 'شغف',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    },
  ];

  const handleSelect = (tab: DashboardTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 sm:top-20 right-0 bottom-0 z-40 w-72 lg:w-64 xl:w-72 bg-slate-900/95 lg:bg-slate-900/50 border-l border-slate-800 p-3 sm:p-4 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-1.5">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            أدوات المذاكرة الذكية
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-right transition-all group relative ${
                    isActive
                      ? 'bg-gradient-to-l from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg transition ${
                        isActive
                          ? 'bg-teal-500/20 text-teal-300'
                          : 'bg-slate-800 text-slate-400 group-hover:text-teal-400 group-hover:bg-slate-700/80'
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    </div>

                    <div className="text-right truncate">
                      <div className="text-sm truncate">{item.label}</div>
                      <div className="text-[11px] text-slate-400 font-normal truncate">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${
                        item.badgeColor
                          ? item.badgeColor
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Motivational Card at bottom of sidebar */}
        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/60 shadow-inner">
          <div className="flex items-center gap-2 mb-1.5 text-teal-300 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>نصيحة المذاكرة اليوم</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            "المذاكرة الفعالة لا تعني ساعات أطول، بل تعني استرجاعاً نشطاً وفهماً للمفاهيم الأساسية."
          </p>
        </div>
      </aside>
    </>
  );
};
