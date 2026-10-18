import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Rotate3d,
  CheckCircle,
  XCircle,
  Plus,
  Shuffle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Flashcard, SavedMaterial } from '../types';
import { INITIAL_FLASHCARDS, SAMPLE_MATERIALS } from '../data/sampleContent';

interface FlashcardsViewProps {
  initialText?: string;
  onSaveMaterial: (material: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onUpdateFlashcardProgress: (masteredCount: number) => void;
  hasGeminiKey: boolean;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  initialText = '',
  onSaveMaterial,
  onUpdateFlashcardProgress,
  hasGeminiKey,
}) => {
  const [cards, setCards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [topicInput, setTopicInput] = useState(initialText);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (initialText) {
      setTopicInput(initialText);
    }
  }, [initialText]);

  const handleGenerateCards = async () => {
    if (!topicInput.trim()) return;

    setIsLoading(true);
    setIsFlipped(false);

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicOrText: topicInput,
          count: 4,
        }),
      });

      const data = await response.json();
      if (data.cards && data.cards.length > 0) {
        setCards(data.cards);
        setCurrentIdx(0);
      }
    } catch (err) {
      console.error('Flashcards error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMastery = (mastered: boolean) => {
    const updated = [...cards];
    if (updated[currentIdx]) {
      updated[currentIdx].mastered = mastered;
      setCards(updated);

      const masteredCount = updated.filter((c) => c.mastered).length;
      onUpdateFlashcardProgress(masteredCount);
    }

    // Move to next card smoothly
    setIsFlipped(false);
    if (currentIdx < cards.length - 1) {
      setTimeout(() => setCurrentIdx(currentIdx + 1), 250);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIdx(0);
  };

  const handleAddCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `custom-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      category: newCategory.trim() || 'عام',
      difficulty: 'medium',
      mastered: false,
    };

    setCards((prev) => [...prev, newCard]);
    setNewFront('');
    setNewBack('');
    setNewCategory('');
    setShowAddModal(false);
    setCurrentIdx(cards.length); // jump to newly added card
  };

  const masteredTotal = cards.filter((c) => c.mastered).length;
  const progressPercent = cards.length ? Math.round((masteredTotal / cards.length) * 100) : 0;
  const currentCard = cards[currentIdx];

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-400" />
            بطاقات الحفظ والاستذكار (Flashcards)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            احفظ أسرع بتقنية التكرار المتباعد والبطاقات التفاعلية ثلاثية الأبعاد
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>إضافة بطاقة يدوية</span>
          </button>
        </div>
      </div>

      {/* Generator Box */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            توليد بطاقات من مادة نموذجية:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_MATERIALS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => setTopicInput(sample.title)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="اكتب اسم الدرس أو المفهوم لتوليد بطاقات حفظ ذكية له..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition"
          />

          <button
            onClick={handleGenerateCards}
            disabled={isLoading || !topicInput.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md transition flex-shrink-0"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جارٍ التوليد...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>توليد البطاقات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white">
            البطاقة {cards.length > 0 ? currentIdx + 1 : 0} من {cards.length}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-28 sm:w-40 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-teal-300 font-bold">{progressPercent}% أتقنتها</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            title="خلط البطاقات عشوائياً"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>خلط البطاقات</span>
          </button>
        </div>
      </div>

      {/* 3D Interactive Flip Card Area */}
      {currentCard ? (
        <div className="flex flex-col items-center space-y-6">
          <div
            onClick={handleFlip}
            className="w-full max-w-xl h-72 sm:h-80 perspective-1000 cursor-pointer select-none group"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front of Card (Question / Term) */}
              <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-teal-500/30 p-6 sm:p-8 flex flex-col justify-between shadow-2xl group-hover:border-teal-400/60 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    {currentCard.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Rotate3d className="w-3.5 h-3.5 text-teal-400" />
                    انقر للقلب وعرض الإجابة
                  </span>
                </div>

                <div className="text-center my-auto px-4">
                  <div className="text-xs text-teal-400 uppercase tracking-widest font-bold mb-2">
                    وجه البطاقة (السؤال / المصطلح)
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {currentCard.front}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>الصعوبة: {currentCard.difficulty === 'easy' ? 'سهل' : currentCard.difficulty === 'hard' ? 'صعب' : 'متوسط'}</span>
                  {currentCard.mastered && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> أتقنتها
                    </span>
                  )}
                </div>
              </div>

              {/* Back of Card (Answer / Explanation) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 border-2 border-teal-400/60 p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    الإجابة والشرح الوافي
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Rotate3d className="w-3.5 h-3.5 text-cyan-400" />
                    انقر للعودة للسؤال
                  </span>
                </div>

                <div className="text-center my-auto px-4">
                  <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                    {currentCard.back}
                  </p>
                </div>

                <div className="flex items-center justify-center text-xs text-teal-300 pt-2 border-t border-slate-800/80">
                  <span>قيم حفظك لهذه البطاقة بالأسفل 👇</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mastery & Navigation Actions */}
          <div className="w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
              title="البطاقة السابقة"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Mastery Rating Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <button
                onClick={() => handleMastery(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-bold transition active:scale-95"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>أحتاج مراجعتها</span>
              </button>

              <button
                onClick={() => handleMastery(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-bold transition active:scale-95"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>أعرفها تماماً (إتقان)</span>
              </button>
            </div>

            <button
              onClick={() => setCurrentIdx((i) => Math.min(cards.length - 1, i + 1))}
              disabled={currentIdx === cards.length - 1}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
              title="البطاقة التالية"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-slate-600" />
          <div className="text-sm font-bold text-white">لا توجد بطاقات حالياً</div>
          <p className="text-xs">اكتب موضوعاً بالأعلى أو أضف بطاقة يدوية للبدء</p>
        </div>
      )}

      {/* Add Custom Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-400" />
                إضافة بطاقة تعليمية جديدة
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomCard} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  وجه البطاقة (السؤال أو المصطلح):
                </label>
                <input
                  type="text"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="مثلاً: ما هي وظيفة الريبوسومات؟"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ظهر البطاقة (الإجابة والتعريف):
                </label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="مثلاً: تصنيع البروتينات اللازمة لنمو الخلية..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  المادة أو التصنيف (اختياري):
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="أحياء، فيزياء، لغات..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                />
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
                  حفظ البطاقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
