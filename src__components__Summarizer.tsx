import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Bookmark,
  Share2,
  HelpCircle,
  AlertCircle,
  Lightbulb,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { SummaryResult, SavedMaterial } from '../types';
import { SAMPLE_MATERIALS } from '../data/sampleContent';

interface SummarizerProps {
  initialText?: string;
  onSaveMaterial: (material: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onSendToQuiz: (text: string) => void;
  hasGeminiKey: boolean;
}

export const Summarizer: React.FC<SummarizerProps> = ({
  initialText = '',
  onSaveMaterial,
  onSendToQuiz,
  hasGeminiKey,
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [style, setStyle] = useState<'balanced' | 'bullets' | 'comprehensive'>('balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setErrorMessage('الرجاء كتابة أو لصق نص المادة الدراسية لتلخيصها');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          length,
          style,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل التلخيص في الخادم');
      }

      const data: SummaryResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('Summarize error:', err);
      setErrorMessage('حدث خطأ أثناء التلخيص. تم تفعيل المحرك المحلي تلقائياً.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const fullText = `${result.title}\n\nنظرة عامة:\n${result.overview}\n\nالأفكار الرئيسية:\n${result.mainPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nالمصطلحات:\n${result.definitions.map((d) => `• ${d.term}: ${d.definition}`).join('\n')}\n\nنصائح الاختبار:\n${result.examTips.map((t) => `* ${t}`).join('\n')}`;

    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    onSaveMaterial({
      title: result.title,
      type: 'summary',
      subject: 'ملخص دراسي',
      tags: ['ملخص', 'مهم'],
      content: result,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-400" />
            تلخيص المواد والمذكرات الدراسية
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            حوّل الفصول الطويلة إلى أفكار محورية، مصطلحات مركزة، ونقاط امتحان ذكية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {hasGeminiKey ? 'Gemini 3.8 Flash' : 'المحرك التعليمي المحلي'}
          </span>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 sm:p-6 space-y-4 shadow-xl">
        {/* Sample Loaders */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            اختر نموذجاً دراسياً للتجربة الفورية:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_MATERIALS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => setInputText(sample.fullText)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                {sample.subject}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="الصق نص المحاضرة، المقال، أو الفصل الدراسي هنا..."
            rows={7}
            className="w-full p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition resize-y"
          />
          {inputText && (
            <div className="absolute left-3 bottom-3 text-[11px] text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              {inputText.length} حرف | ~{Math.round(inputText.split(/\s+/).length)} كلمة
            </div>
          )}
        </div>

        {/* Options & Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            {/* Length selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-2">الحجم:</span>
              <button
                onClick={() => setLength('short')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  length === 'short' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                موجز سريع
              </button>
              <button
                onClick={() => setLength('medium')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  length === 'medium' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                متوازن
              </button>
              <button
                onClick={() => setLength('detailed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  length === 'detailed' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                مفصل
              </button>
            </div>

            {/* Style selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-2">النمط:</span>
              <button
                onClick={() => setStyle('balanced')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  style === 'balanced' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                شامل
              </button>
              <button
                onClick={() => setStyle('bullets')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  style === 'bullets' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                نقاط مركزة
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs border border-slate-700 transition"
              >
                مسح
              </button>
            )}

            <button
              onClick={handleSummarize}
              disabled={isLoading || !inputText.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md shadow-teal-500/20 transition active:scale-95 flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>جارٍ التلخيص والتحليل...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>تلخيص المادة الآن</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Summary Output Area */}
      {result && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
          {/* Output Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  {result.engine || 'المحرك الذكي'}
                </span>
                <span className="text-xs text-slate-400">تم التلخيص بنجاح</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                {result.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'تم النسخ' : 'نسخ'}</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition"
              >
                {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'تم الحفظ بالمكتبة' : 'حفظ في المفكرة'}</span>
              </button>

              <button
                onClick={() => onSendToQuiz(result.overview + ' ' + result.mainPoints.join(' '))}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow transition active:scale-95"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>اختبر نفسك في هذا الملخص</span>
              </button>
            </div>
          </div>

          {/* 1. Overview */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              النظرة العامة والأهمية العلمية
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              {result.overview}
            </p>
          </div>

          {/* 2. Main Key Points */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              الأفكار والمحاور الجوهرية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.mainPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3 hover:border-teal-500/30 transition"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Definitions & Core Terminology */}
          {result.definitions && result.definitions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                المصطلحات والمفاهيم الرئيسية
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.definitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1"
                  >
                    <div className="text-xs font-bold text-amber-300">
                      {def.term}
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      {def.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Exam Focus Tips */}
          {result.examTips && result.examTips.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 to-slate-950 border border-teal-500/20 space-y-2">
              <h4 className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-teal-400" />
                نصائح واستراتيجيات للاختبار
              </h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {result.examTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
