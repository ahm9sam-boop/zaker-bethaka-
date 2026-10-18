import React from 'react';
import {
  Sparkles,
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
  ArrowLeft,
  Flame,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { DashboardTab } from '../types';
import { SAMPLE_MATERIALS } from '../data/sampleContent';

interface DashboardHomeProps {
  onTabChange: (tab: DashboardTab) => void;
  onSelectSample: (sampleId: string, targetTab: DashboardTab) => void;
  streakDays: number;
  studyMinutes: number;
  completedTasksCount: number;
  totalTasksCount: number;
  hasGeminiKey: boolean;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onTabChange,
  onSelectSample,
  streakDays,
  studyMinutes,
  completedTasksCount,
  totalTasksCount,
  hasGeminiKey,
}) => {
  const featureCards = [
    {
      id: 'assistant' as DashboardTab,
      title: 'المساعد الدراسي الذكي',
      subtitle: 'حوار تفاعلي للإجابة عن أسئلتك وشرح المعضلات',
      icon: Bot,
      gradient: 'from-cyan-500/20 to-teal-500/20',
      border: 'hover:border-teal-500/50',
      iconColor: 'text-teal-400 bg-teal-500/10',
      badge: 'مباشر',
    },
    {
      id: 'summarizer' as DashboardTab,
      title: 'تلخيص المواد الدراسية',
      subtitle: 'استخراج الأفكار الجوهرية والمصطلحات ونقاط الاختبار',
      icon: FileText,
      gradient: 'from-blue-500/20 to-indigo-500/20',
      border: 'hover:border-indigo-500/50',
      iconColor: 'text-indigo-400 bg-indigo-500/10',
      badge: 'فوري',
    },
    {
      id: 'pdf_reader' as DashboardTab,
      title: 'قراءة وتحليل PDF',
      subtitle: 'رفع الكتب والمذكرات واستخراج النصوص للمذاكرة الذكية',
      icon: FileSpreadsheet,
      gradient: 'from-emerald-500/20 to-teal-500/20',
      border: 'hover:border-emerald-500/50',
      iconColor: 'text-emerald-400 bg-emerald-500/10',
      badge: 'مهم',
    },
    {
      id: 'transcription' as DashboardTab,
      title: 'تفريغ المحاضرات',
      subtitle: 'تسجيل الصوت أو رفع ملف وتحويله لنصوص وتلخيص فوري',
      icon: Mic,
      gradient: 'from-amber-500/20 to-orange-500/20',
      border: 'hover:border-amber-500/50',
      iconColor: 'text-amber-400 bg-amber-500/10',
      badge: 'صوتي',
    },
    {
      id: 'mindmaps' as DashboardTab,
      title: 'الخرائط الذهنية',
      subtitle: 'تنظيم شجري بصري يربط الفروع بالأصول لترسيخ الفهم',
      icon: GitFork,
      gradient: 'from-purple-500/20 to-pink-500/20',
      border: 'hover:border-purple-500/50',
      iconColor: 'text-purple-400 bg-purple-500/10',
      badge: 'تفاعلي',
    },
    {
      id: 'quizzes' as DashboardTab,
      title: 'توليد الاختبارات',
      subtitle: 'اختبارات اختيار من متعدد وصح وخطأ مع تصحيح وتحليل',
      icon: HelpCircle,
      gradient: 'from-sky-500/20 to-cyan-500/20',
      border: 'hover:border-sky-500/50',
      iconColor: 'text-sky-400 bg-sky-500/10',
      badge: 'تقييم',
    },
    {
      id: 'flashcards' as DashboardTab,
      title: 'بطاقات الحفظ (Flashcards)',
      subtitle: 'تقليب بطاقات 3D مع تقنية التكرار المتباعد لتثبيت الحفظ',
      icon: Layers,
      gradient: 'from-teal-500/20 to-emerald-500/20',
      border: 'hover:border-teal-500/50',
      iconColor: 'text-teal-400 bg-teal-500/10',
      badge: 'حفظ سريع',
    },
    {
      id: 'planner' as DashboardTab,
      title: 'مخطط المذاكرة وبومودورو',
      subtitle: 'جدول مهام، مواعيد تسليم، ومؤقت تركيز 25 دقيقة',
      icon: CalendarCheck,
      gradient: 'from-rose-500/20 to-amber-500/20',
      border: 'hover:border-rose-500/50',
      iconColor: 'text-rose-400 bg-rose-500/10',
      badge: 'تنظيم',
    },
    {
      id: 'saved' as DashboardTab,
      title: 'المذكرات والمحفوظات',
      subtitle: 'مكتبتك الخاصة لحفظ الملخصات والاختبارات محلياً',
      icon: Bookmark,
      gradient: 'from-slate-500/20 to-cyan-500/20',
      border: 'hover:border-slate-500/50',
      iconColor: 'text-slate-300 bg-slate-700/50',
      badge: 'محلي',
    },
    {
      id: 'progress' as DashboardTab,
      title: 'لوحة التقدم والإنجاز',
      subtitle: 'متابعة ساعات المذاكرة ومعدل الإتقان والأوسمة',
      icon: TrendingUp,
      gradient: 'from-emerald-500/20 to-blue-500/20',
      border: 'hover:border-emerald-500/50',
      iconColor: 'text-emerald-400 bg-emerald-500/10',
      badge: 'إحصائيات',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 border border-teal-500/30 p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs sm:text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>أهلاً بك في رفيقك الأكاديمي الذكي</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              ذاكر بذكاء، استوعب أسرع، وحقق أعلى الدرجات
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              منصة شاملة تجمع بين تقنيات الذكاء الاصطناعي الحديثة وأفضل ممارسات علوم الذاكرة لتلخيص مادتك، توليد اختبارات فورية، ورسم خرائط ذهنية ميسرة.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onTabChange('assistant')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition transform active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span>ابدأ محادثة مع المساعد</span>
              </button>

              <button
                onClick={() => onTabChange('pdf_reader')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white font-semibold text-sm border border-slate-700 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                <span>رفع وقراءة ملف PDF</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm min-w-[260px]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Flame className="w-5 h-5 fill-amber-400/20" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{streakDays} أيام</div>
                <div className="text-xs text-slate-400">حماس مستمر</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{studyMinutes} دقيقة</div>
                <div className="text-xs text-slate-400">وقت المذاكرة</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {completedTasksCount}/{totalTasksCount}
                </div>
                <div className="text-xs text-slate-400">مهام منجزة</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* 10 Main Dashboard Feature Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              أدوات المنصة الأساسية
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              اختر الأداة المناسبة لخطوتك الدراسية القادمة
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onTabChange(card.id)}
                className={`group relative p-4 rounded-2xl bg-slate-900/80 border border-slate-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${card.border}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${card.iconColor} transition-transform group-hover:scale-110`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-teal-300 transition">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {card.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-teal-400 group-hover:text-teal-300">
                  <span>فتح الأداة</span>
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instant Arabic Study Samples Starter */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              نماذج تعليمية جاهزة للتجربة المباشرة
            </h3>
            <p className="text-xs text-slate-400">
              يمكنك تجربة جميع أدوات المنصة فوراً بدون الحاجة لكتابة نصوص يدوية
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_MATERIALS.map((sample) => (
            <div
              key={sample.id}
              className="p-4 rounded-xl bg-slate-850/80 bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {sample.subject}
                </span>
                <h4 className="text-sm font-bold text-white mt-2 mb-1.5">{sample.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {sample.excerpt}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-1 text-xs">
                <button
                  onClick={() => onSelectSample(sample.id, 'summarizer')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-teal-500/20 hover:text-teal-300 text-slate-300 font-medium transition"
                >
                  تلخيص
                </button>
                <button
                  onClick={() => onSelectSample(sample.id, 'quizzes')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 font-medium transition"
                >
                  اختبار
                </button>
                <button
                  onClick={() => onSelectSample(sample.id, 'assistant')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-300 text-slate-300 font-medium transition"
                >
                  محادثة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
