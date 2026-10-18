import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Bookmark,
  Clock,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  AlertCircle,
  Check,
} from 'lucide-react';
import { QuizQuestion, SavedMaterial } from '../types';
import { SAMPLE_MATERIALS } from '../data/sampleContent';

interface QuizGeneratorProps {
  initialText?: string;
  onSaveMaterial: (material: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onUpdateQuizProgress: (scorePercentage: number) => void;
  hasGeminiKey: boolean;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  initialText = '',
  onSaveMaterial,
  onUpdateQuizProgress,
  hasGeminiKey,
}) => {
  const [topicInput, setTopicInput] = useState(initialText);
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizType, setQuizType] = useState<'mixed' | 'mcq' | 'true_false'>('mixed');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'sample-q1',
      question: 'أي من العضيات التالية تعتبر محطة توليد الطاقة (ATP) في الخلية؟',
      type: 'mcq',
      options: ['الميتوكوندريا', 'الغشاء البلازمي', 'الريبوسوم', 'الفجوة العصارية'],
      correctAnswer: 'الميتوكوندريا',
      explanation: 'الميتوكوندريا هي المسؤولة عن التنفس الخلوي وإنتاج جزيئات ATP الحاملة للطاقة في الخلايا حقيقية النواة.',
    },
    {
      id: 'sample-q2',
      question: 'الخلايا بدائية النوى (Prokaryotes) تمتلك نواة حقيقية محاطة بغشاء نووي مزدوج.',
      type: 'true_false',
      options: ['صحيح', 'خطأ'],
      correctAnswer: 'خطأ',
      explanation: 'الخلايا بدائية النوى كالبكتيريا تفتقر إلى غشاء نووي يحيط بمادتها الوراثية وتكون المادة الوراثية سابحة في السيتوبلازم.',
    },
    {
      id: 'sample-q3',
      question: 'ما هو دور الغشاء البلازمي في الخلية الحية؟',
      type: 'mcq',
      options: [
        'النفاذية الاختيارية وتنظيم مرور المواد الغذائية والغازات',
        'توليد الكروموسومات الوراثية',
        'امتصاص ضوء الشمس في البناء الضوئي فقط',
        'تدمير كافة البروتينات السيتوبلازمية',
      ],
      correctAnswer: 'النفاذية الاختيارية وتنظيم مرور المواد الغذائية والغازات',
      explanation: 'يتكون الغشاء البلازمي من طبقة دهنية ثنائية تسمح بالمرور المنظم للمواد التي تحتاجها الخلية وتطرد الفضلات.',
    },
  ]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialText) {
      setTopicInput(initialText);
    }
  }, [initialText]);

  const handleGenerateQuiz = async () => {
    if (!topicInput.trim()) return;

    setIsLoading(true);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setCurrentIdx(0);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicOrText: topicInput,
          count: questionCount,
          difficulty,
          type: quizType,
        }),
      });

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Quiz generate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);

    // Calculate score
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    onUpdateQuizProgress(percentage);

    if (percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
  };

  const handleSaveQuiz = () => {
    onSaveMaterial({
      title: `اختبار: ${topicInput.slice(0, 30) || 'مراجعة عامة'}`,
      type: 'quiz',
      subject: 'اختبارات تجريبية',
      tags: ['اختبار', 'تقييم'],
      content: {
        questions,
        answers: selectedAnswers,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const currentQ = questions[currentIdx];
  const totalCorrect = questions.filter((q) => selectedAnswers[q.id] === q.correctAnswer).length;
  const scorePercent = questions.length ? Math.round((totalCorrect / questions.length) * 100) : 0;
  const allAnswered = questions.length > 0 && questions.every((q) => selectedAnswers[q.id]);

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-sky-400" />
            توليد الاختبارات التفاعلية والتقييمات
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            أنشئ أسئلة اختيار من متعدد وصح أو خطأ فورية لاختبار استيعابك للمادة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {hasGeminiKey ? 'Gemini 3.8 Flash' : 'المحرك التعليمي المحلي'}
          </span>
        </div>
      </div>

      {/* Generator Controls Card */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
        {/* Sample pickers */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            توليد اختبار من النماذج الجاهزة:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_MATERIALS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => setTopicInput(sample.fullText)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="relative">
          <textarea
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="اكتب موضوع الدرس، أو الصق فقرة من كتابك لإنشاء أسئلة اختبار دقيقة حولها..."
            rows={3}
            className="w-full p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition resize-none"
          />
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            {/* Number of questions */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-2">عدد الأسئلة:</span>
              {[3, 5, 8].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    questionCount === count ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-2">الصعوبة:</span>
              <button
                onClick={() => setDifficulty('easy')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  difficulty === 'easy' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                سهل
              </button>
              <button
                onClick={() => setDifficulty('medium')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  difficulty === 'medium' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                متوسط
              </button>
              <button
                onClick={() => setDifficulty('hard')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  difficulty === 'hard' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                متقدم
              </button>
            </div>

            {/* Type */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-2">النوع:</span>
              <button
                onClick={() => setQuizType('mixed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  quizType === 'mixed' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                مزيج
              </button>
              <button
                onClick={() => setQuizType('mcq')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  quizType === 'mcq' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                اختيار متعدد
              </button>
              <button
                onClick={() => setQuizType('true_false')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  quizType === 'true_false' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                صح وخطأ
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={isLoading || !topicInput.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md transition"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جارٍ بناء الأسئلة...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>توليد الاختبار الآن</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Quiz Runner */}
      {questions.length > 0 && currentQ && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Top Progress & Score Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                السؤال {currentIdx + 1} من {questions.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {currentQ.type === 'mcq' ? 'اختيار من متعدد' : 'صح أو خطأ'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isSubmitted && (
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className={scorePercent >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                    الدرجة: {scorePercent}% ({totalCorrect}/{questions.length})
                  </span>
                </div>
              )}

              <button
                onClick={handleSaveQuiz}
                className="flex items-center gap-1 hover:text-white transition"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'تم الحفظ' : 'حفظ الاختبار'}</span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === opt;
                const isCorrect = opt === currentQ.correctAnswer;
                const isWrongSelection = isSubmitted && isSelected && !isCorrect;
                const isCorrectShow = isSubmitted && isCorrect;

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(currentQ.id, opt)}
                    disabled={isSubmitted}
                    className={`w-full p-4 rounded-2xl text-right text-sm font-medium transition-all flex items-center justify-between ${
                      isCorrectShow
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-200'
                        : isWrongSelection
                        ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-200'
                        : isSelected
                        ? 'bg-sky-500/20 border-2 border-sky-500 text-sky-200'
                        : 'bg-slate-950/70 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isCorrectShow && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {isWrongSelection && <XCircle className="w-5 h-5 text-rose-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Educational Feedback / Explanation if submitted */}
          {isSubmitted && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <AlertCircle className="w-4 h-4" />
                <span>التفسير والشرح التربوي:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <div className="flex items-center gap-2">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تصحيح الاختبار وعرض النتيجة</span>
                </button>
              ) : (
                <button
                  onClick={handleResetQuiz}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة المحاولة</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIdx === questions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition"
            >
              <span>التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
