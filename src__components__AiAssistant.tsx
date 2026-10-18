import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bookmark,
  Trash2,
  FileText,
  HelpCircle,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { ChatMessage, SavedMaterial } from '../types';
import { SAMPLE_MATERIALS } from '../data/sampleContent';

interface AiAssistantProps {
  initialContext?: string;
  onSaveMaterial: (material: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  hasGeminiKey: boolean;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  initialContext = '',
  onSaveMaterial,
  hasGeminiKey,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `مرحباً بك! أنا مساعدك التعليمي الذكي في "ذاكر بذكاء" 🎓.
يمكنك سؤالي عن أي درس، طلب شرح مصطلح معقد، صياغة مسائل تدريبية، أو تلخيص نقاطك الدراسية.

💡 نصيحة: يمكنك إرفاق نص المادة أو فتح ملف PDF وسأقوم بالإجابة اعتماداً على سياق كتابك مباشرة!`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      source: hasGeminiKey ? 'Gemini 3.8 Flash' : 'المحرك التعليمي الذكي',
      isLiveAi: hasGeminiKey,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studyContext, setStudyContext] = useState(initialContext);
  const [showContextPanel, setShowContextPanel] = useState(Boolean(initialContext));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialContext) {
      setStudyContext(initialContext);
      setShowContextPanel(true);
    }
  }, [initialContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const suggestedPrompts = [
    'اشرح لي هذا المفهوم كأنني مبتدئ مع أمثلة واقعية',
    'ما هي الأسئلة الأكثر وروداً في الامتحانات على هذا الدرس؟',
    'لخص لي الفروق الجوهرية بين المفاهيم في جدول نقاط',
    'أعطني تشبيهاً ذكياً يسهل عليّ تذكر هذه المعلومة',
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          studyContext: studyContext.trim() || undefined,
        }),
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: data.reply || 'عذراً، حدث خطأ أثناء تكوين الإجابة.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        source: data.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'المحرك التعليمي المحلي',
        isLiveAi: data.isLiveAi ?? false,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: 'تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم والمحاولة مرة أخرى.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        source: 'النظام',
        isLiveAi: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveToNotebook = (msg: ChatMessage) => {
    onSaveMaterial({
      title: `ملاحظة: ${msg.content.slice(0, 35)}...`,
      type: 'note',
      subject: 'ملاحظات المساعد الذكي',
      tags: ['مساعد', 'شرح'],
      content: { text: msg.content, timestamp: msg.timestamp },
    });
    setSavedSuccessId(msg.id);
    setTimeout(() => setSavedSuccessId(null), 2500);
  };

  const handleClearChat = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في مسح المحادثة الحالية؟')) {
      setMessages([
        {
          id: 'welcome-reset',
          sender: 'assistant',
          content: 'تم بدء جلسة محادثة جديدة. كيف يمكنني مساعدتك اليوم؟',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          source: hasGeminiKey ? 'Gemini 3.8 Flash' : 'المحرك التعليمي الذكي',
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[550px] bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Assistant Header & Context Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30 text-teal-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              المساعد الدراسي الذكي
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {hasGeminiKey ? 'Gemini 3.8 Flash' : 'محرك تعليمي ذكي'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              اسأل وسيقوم الذكاء بشرح وتبسيط وتحليل المادة الدراسية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowContextPanel(!showContextPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              studyContext.trim()
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>
              {studyContext.trim() ? 'سياق المادة (مرفق)' : 'إرفاق نص المادة'}
            </span>
          </button>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Study Context Drawer */}
      {showContextPanel && (
        <div className="p-3 bg-slate-950/70 border-b border-slate-800 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              النص المرجعي للمذاكرة (سياق الأسئلة):
            </span>
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  const s = SAMPLE_MATERIALS.find((m) => m.id === e.target.value);
                  if (s) setStudyContext(s.fullText);
                }}
                className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                defaultValue=""
              >
                <option value="" disabled>
                  اختر من النماذج الجاهزة...
                </option>
                {SAMPLE_MATERIALS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
              {studyContext && (
                <button
                  onClick={() => setStudyContext('')}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  إفراغ
                </button>
              )}
            </div>
          </div>
          <textarea
            value={studyContext}
            onChange={(e) => setStudyContext(e.target.value)}
            placeholder="الصق نص المحاضرة أو مقتطفات الدرس هنا ليرتكز المساعد عليها في الإجابات..."
            rows={2}
            className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500/50 resize-none"
          />
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
            >
              <div
                className={`p-2 rounded-2xl flex-shrink-0 h-9 w-9 flex items-center justify-center ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-teal-500 text-white'
                    : 'bg-slate-800 border border-slate-700 text-teal-400'
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div
                className={`flex flex-col space-y-1.5 max-w-[85%] sm:max-w-[78%] ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-tr-none shadow-md shadow-teal-900/30'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Message footer actions */}
                <div className="flex items-center gap-2 px-2 text-[11px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.source && (
                    <>
                      <span>•</span>
                      <span className="text-teal-400/80">{msg.source}</span>
                    </>
                  )}

                  {!isUser && (
                    <div className="flex items-center gap-1.5 mr-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 hover:text-white transition"
                        title="نسخ النص"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className={`p-1 hover:text-white transition ${
                          speakingId === msg.id ? 'text-teal-300 animate-pulse' : ''
                        }`}
                        title="قراءة صوتية"
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-teal-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSaveToNotebook(msg)}
                        className="p-1 hover:text-white transition"
                        title="حفظ في المذكرات"
                      >
                        {savedSuccessId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-xl ml-auto">
            <div className="p-2 rounded-2xl bg-slate-800 border border-slate-700 text-teal-400 h-9 w-9 flex items-center justify-center">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="p-4 rounded-3xl bg-slate-800/80 border border-slate-700/80 rounded-tl-none flex items-center gap-2 text-xs text-slate-300">
              <span className="flex space-x-1 space-x-reverse">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-teal-300 animate-bounce delay-200" />
              </span>
              <span>المساعد يحلل ويكتب الإجابة التعليمية...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Chips */}
      <div className="px-4 py-2 border-t border-slate-800/70 bg-slate-900/50 flex gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-1 flex-shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>مقترحات:</span>
        </div>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 whitespace-nowrap transition flex-shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب سؤالك أو استفسارك هنا..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-md shadow-teal-500/20 transition flex items-center gap-2 flex-shrink-0"
          >
            <span>إرسال</span>
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
