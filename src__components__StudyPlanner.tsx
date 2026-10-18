import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Filter,
  Check,
  AlertCircle,
} from 'lucide-react';
import { StudyTask } from '../types';
import { INITIAL_TASKS } from '../data/sampleContent';

interface StudyPlannerProps {
  tasks: StudyTask[];
  onUpdateTasks: (tasks: StudyTask[]) => void;
  onAddStudyMinutes: (minutes: number) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  tasks,
  onUpdateTasks,
  onAddStudyMinutes,
}) => {
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('اليوم');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskMinutes, setTaskMinutes] = useState(30);

  // Pomodoro Timer State
  const POMODORO_WORK_SECONDS = 25 * 60;
  const POMODORO_BREAK_SECONDS = 5 * 60;
  const [timerSeconds, setTimerSeconds] = useState(POMODORO_WORK_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            // Timer completed!
            if (timerMode === 'work') {
              onAddStudyMinutes(25);
              setTimerMode('break');
              return POMODORO_BREAK_SECONDS;
            } else {
              setTimerMode('work');
              return POMODORO_WORK_SECONDS;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerMode]);

  const handleToggleComplete = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    onUpdateTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    onUpdateTasks(updated);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTask) {
      const updated = tasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: taskTitle.trim(),
              subject: taskSubject.trim() || 'عام',
              dueDate: taskDueDate,
              priority: taskPriority,
              estimatedMinutes: taskMinutes,
            }
          : t
      );
      onUpdateTasks(updated);
      setEditingTask(null);
    } else {
      const newTask: StudyTask = {
        id: `task-${Date.now()}`,
        title: taskTitle.trim(),
        subject: taskSubject.trim() || 'عام',
        dueDate: taskDueDate,
        priority: taskPriority,
        completed: false,
        estimatedMinutes: taskMinutes,
      };
      onUpdateTasks([...tasks, newTask]);
    }

    // Reset form
    setTaskTitle('');
    setTaskSubject('');
    setTaskDueDate('اليوم');
    setTaskPriority('medium');
    setTaskMinutes(30);
    setShowAddModal(false);
  };

  const startEdit = (t: StudyTask) => {
    setEditingTask(t);
    setTaskTitle(t.title);
    setTaskSubject(t.subject);
    setTaskDueDate(t.dueDate);
    setTaskPriority(t.priority);
    setTaskMinutes(t.estimatedMinutes);
    setShowAddModal(true);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const subjects = Array.from(new Set(tasks.map((t) => t.subject)));
  const filteredTasks =
    filterSubject === 'all' ? tasks : tasks.filter((t) => t.subject === filterSubject);

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-rose-400" />
            مخطط المذاكرة ومؤقت بومودورو
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            نظم مهامك الدراسية، قسّم وقتك إلى جلسات مركزة، وتابع إنجازك اليومي
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setTaskTitle('');
            setTaskSubject('');
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهمة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pomodoro Focus Timer Widget (1 col) */}
        <div className="lg:col-span-1 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800/80">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              مؤقت التركيز (بومودورو)
            </span>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                if (timerMode === 'work') {
                  setTimerMode('break');
                  setTimerSeconds(POMODORO_BREAK_SECONDS);
                } else {
                  setTimerMode('work');
                  setTimerSeconds(POMODORO_WORK_SECONDS);
                }
              }}
              className={`px-2.5 py-1 rounded-full font-bold cursor-pointer transition ${
                timerMode === 'work'
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              }`}
              title="انقر للتبديل بين جلسة المذاكرة والاستراحة"
            >
              {timerMode === 'work' ? 'جلسة تركيز 🎯' : 'استراحة قصيرة ☕'}
            </button>
          </div>

          {/* Clock Dial Circle */}
          <div className="my-6 relative flex items-center justify-center">
            <div className="w-44 h-44 rounded-full border-4 border-slate-800 flex items-center justify-center relative bg-slate-950/60 shadow-inner">
              <div
                className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin-slow transition-colors ${
                  timerMode === 'work' ? 'border-teal-400' : 'border-emerald-400'
                }`}
              />
              <div className="text-center">
                <div className="text-4xl font-mono font-black text-white tracking-wider">
                  {formatTimer(timerSeconds)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {timerMode === 'work' ? '25 دقيقة مذاكرة' : '5 دقائق راحة'}
                </div>
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="w-full flex items-center justify-center gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition transform active:scale-95 ${
                isTimerRunning
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>بدء الجلسة</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(
                  timerMode === 'work' ? POMODORO_WORK_SECONDS : POMODORO_BREAK_SECONDS
                );
              }}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="إعادة ضبط المؤقت"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 text-[11px] text-center text-slate-400">
            عند اكتمال كل 25 دقيقة يتم احتساب وقت المذاكرة وإضافته تلقائياً للوحة تقدمك.
          </div>
        </div>

        {/* Task List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 flex items-center gap-1 font-semibold">
                <Filter className="w-3.5 h-3.5" />
                المادة:
              </span>
              <button
                onClick={() => setFilterSubject('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterSubject === 'all'
                    ? 'bg-teal-500/20 text-teal-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل ({tasks.length})
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setFilterSubject(sub)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterSubject === sub
                      ? 'bg-teal-500/20 text-teal-300 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            <div className="text-slate-400">
              أنجزت <span className="text-teal-400 font-bold">{completedCount}</span> من {tasks.length} مهام
            </div>
          </div>

          {/* Tasks Container */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredTasks.map((task) => {
              const priorityStyles = {
                high: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
                medium: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
                low: 'bg-slate-700/50 text-slate-300 border-slate-700',
              };

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900/80 border-slate-800 hover:border-teal-500/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className="text-teal-400 hover:text-teal-300 transition flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-400 fill-teal-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-teal-400" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-sm font-semibold truncate ${
                          task.completed ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {task.subject}
                        </span>
                        <span>•</span>
                        <span>موعد: {task.dueDate}</span>
                        <span>•</span>
                        <span>{task.estimatedMinutes} دقيقة</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        priorityStyles[task.priority]
                      }`}
                    >
                      {task.priority === 'high' ? 'أولوية قصوى' : task.priority === 'medium' ? 'متوسطة' : 'عادية'}
                    </span>

                    <button
                      onClick={() => startEdit(task)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                      title="تعديل المهمة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition"
                      title="حذف المهمة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                لا توجد مهام مسجلة في هذا القسم. اضغط على "إضافة مهمة جديدة" للبدء.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-teal-400" />
                {editingTask ? 'تعديل المهمة الدراسية' : 'إضافة مهمة دراسية جديدة'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  عنوان المهمة:
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="مثلاً: قراءة وحفظ الفصل الثالث من التاريخ"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    اسم المادة:
                  </label>
                  <input
                    type="text"
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    placeholder="أحياء، فيزياء..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    الموعد المحدد:
                  </label>
                  <input
                    type="text"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    placeholder="اليوم، غداً، الأحد القادم"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    الأولوية:
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="low">عادية</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">قصوى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    الوقت المقدر (بالدقائق):
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={taskMinutes}
                    onChange={(e) => setTaskMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold"
                >
                  {editingTask ? 'تحديث المهمة' : 'إضافة المهمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
