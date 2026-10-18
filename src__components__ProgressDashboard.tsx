import React from 'react';
import {
  TrendingUp,
  Flame,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  FileText,
  HelpCircle,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { UserProgress } from '../types';

interface ProgressDashboardProps {
  progress: UserProgress;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ progress }) => {
  const badges = [
    {
      id: 'streak-master',
      title: 'شعلة الاستمرار 🔥',
      description: 'المذاكرة لـ 5 أيام متتالية دون انقطاع',
      unlocked: progress.streakDays >= 5,
      icon: Flame,
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'quiz-ace',
      title: 'بطل الاختبارات 🏆',
      description: 'إحراز معدل 80% فما فوق في الاختبارات التدريبية',
      unlocked: progress.averageQuizScore >= 80,
      icon: Award,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'memory-pro',
      title: 'خبير الحفظ والذاكرة 🧠',
      description: 'إتقان أكثر من 5 بطاقات استذكار بنجاح',
      unlocked: progress.cardsMastered >= 5,
      icon: Layers,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'planner-king',
      title: 'منظم الوقت المتفوق ⏱️',
      description: 'إنجاز مهام دراسية محددة بانتظام',
      unlocked: progress.tasksCompleted >= 3,
      icon: CheckCircle2,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const maxMinutes = Math.max(...progress.dailyMinutes.map((d) => d.minutes), 60);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          لوحة التقدم والإنجاز الدراسي
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          راقب تطور ساعات مذاكرتك، ثبات معلوماتك، وحصادك المستمر نحو التفوق
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ساعات المذاكرة الكلية</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {(progress.totalStudyMinutes / 60).toFixed(1)} <span className="text-xs text-slate-400 font-normal">ساعة</span>
          </div>
          <div className="text-[11px] text-teal-400 font-medium">
            يعادل {progress.totalStudyMinutes} دقيقة تركيز
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>شعلة الاستمرار</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {progress.streakDays} <span className="text-xs text-slate-400 font-normal">أيام</span>
          </div>
          <div className="text-[11px] text-amber-400 font-medium">
            حماس مستمر وعادة راسخة
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>معدل درجات الاختبارات</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {progress.averageQuizScore}%
          </div>
          <div className="text-[11px] text-sky-400 font-medium">
            في {progress.quizzesTaken} اختبارات تم خوضها
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>بطاقات تم حفظها وإتقانها</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {progress.cardsMastered} <span className="text-xs text-slate-400 font-normal">بطاقة</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            مفاهيم مثبتة بالذاكرة طويلة المدى
          </div>
        </div>
      </div>

      {/* Weekly Activity Visual Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-400" />
              نشاط وساعات المذاكرة خلال الأسبوع الحالي
            </h3>
            <p className="text-xs text-slate-400">
              الوقت المستغرق بالدقائق لكل يوم دراسي
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300">
            أيام الأسبوع
          </span>
        </div>

        {/* Custom Responsive RTL Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 sm:h-52 px-2 border-b border-slate-800">
            {progress.dailyMinutes.map((dayData, idx) => {
              const heightPercent = Math.max(10, Math.round((dayData.minutes / maxMinutes) * 100));
              const isToday = idx === progress.dailyMinutes.length - 1;

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                    {dayData.minutes} د
                  </div>

                  <div className="w-full max-w-[45px] bg-slate-800/80 rounded-2xl p-1 flex items-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-teal-500 to-cyan-400 shadow-lg shadow-teal-500/20'
                          : 'bg-gradient-to-t from-slate-700 to-teal-600/60 group-hover:from-teal-600 group-hover:to-teal-400'
                      }`}
                    />
                  </div>

                  <div
                    className={`text-xs font-semibold ${
                      isToday ? 'text-teal-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {dayData.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          أوسمة الإنجاز والتميز الأكاديمي
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                  badge.unlocked
                    ? 'bg-slate-900 border-teal-500/40 shadow-xl'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-50 grayscale'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-tr ${badge.color} text-white shadow-md`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      badge.unlocked
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {badge.unlocked ? 'مكتمل ✓' : 'قيد التقدم'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{badge.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
