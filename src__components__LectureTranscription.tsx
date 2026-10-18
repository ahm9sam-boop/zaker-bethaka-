import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Upload,
  Play,
  Pause,
  Sparkles,
  FileText,
  Copy,
  Check,
  Bookmark,
  Volume2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SavedMaterial } from '../types';

interface LectureTranscriptionProps {
  onSaveMaterial: (material: Omit<SavedMaterial, 'id' | 'createdAt'>) => void;
  onSendToSummarizer: (text: string) => void;
  hasGeminiKey: boolean;
}

export const LectureTranscription: React.FC<LectureTranscriptionProps> = ({
  onSaveMaterial,
  onSendToSummarizer,
  hasGeminiKey,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<{
    title: string;
    transcription: string;
    summary: string;
    engine?: string;
    durationEstimate?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1];
          setAudioBase64(base64Data);
        };

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Audio recording error:', err);
      setErrorMessage('تعذر الوصول إلى الميكروفون. يمكنك رفع ملف صوتي أو تجربة النموذج التوضيحي أدناه.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Max 25 MB
    const MAX_AUDIO_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_AUDIO_SIZE) {
      const actualMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(
        `حجم الملف الصوتي (${actualMb} ميجابايت) يتجاوز الحد الأقصى المسموح به (25 ميجابايت). يُرجى تقصير التسجيل أو ضغط الملف الصوتي.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      setAudioBase64(base64Data);
    };
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTranscribe = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: audioBase64 || undefined,
          mimeType: 'audio/webm',
          title: 'تسجيل المحاضرة الدراسية',
        }),
      });

      if (!response.ok) {
        throw new Error('فشل تفريغ الصوت في الخادم');
      }

      const data = await response.json();
      setTranscriptResult(data);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage('حدث خطأ أثناء تفريغ الصوت.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLecture = () => {
    setAudioUrl(null);
    setAudioBase64(null);
    setIsLoading(true);
    setTimeout(() => {
      setTranscriptResult({
        title: 'محاضرة: مناهج البحث العلمي واستخلاص النتائج',
        transcription: `أهلاً بكم يا شباب في هذه المحاضرة الهامة. اليوم سنركز على ثلاث ركائز رئيسية في إعداد الأبحاث الجامعية:

أولاً: صياغة الفرضية العلمية (Scientific Hypothesis). يجب أن تكون الفرضية قابلة للاختبار والقياس وليست مجرد انطباع عام.
ثانياً: جمع العينات والبيانات. احرصوا على تنوع مجتمع البحث وتجنب التحيز المعرفي أثناء الاستبيانات أو التجارب المعملية.
ثالثاً: التحليل الإحصائي وتفسير النتائج دون إقحام التوقعات الشخصية. فالأمانة العلمية تقتضي توثيق كافة النتائج حتى غير المتوقعة منها.

في الامتحان النهائي، تأكدوا من مراجعة الفروق بين المنهج الوصفي والمنهج التجريبي، وسيكون هناك سؤال تطبيقي مباشر حول خطوات التحقق من الفرضية.`,
        summary: 'محاضرة أكاديمية تركز على: شروط الفرضية العلمية، طرق جمع البيانات دون تحيز، والتمييز بين المنهج الوصفي والتجريبي للامتحان.',
        engine: hasGeminiKey ? 'Gemini 3.5 Transcribe' : 'المحرك التعليمي المدمج (تفريغ نموذجي)',
        durationEstimate: 'دقيقة ونصف',
      });
      setIsLoading(false);
    }, 600);
  };

  const handleCopy = () => {
    if (!transcriptResult) return;
    navigator.clipboard.writeText(transcriptResult.transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!transcriptResult) return;
    onSaveMaterial({
      title: transcriptResult.title,
      type: 'transcription',
      subject: 'تفريغ محاضرات',
      tags: ['صوتي', 'محاضرة'],
      content: transcriptResult,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Mic className="w-6 h-6 text-amber-400" />
            تفريغ المحاضرات والتسجيلات الصوتية
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            سجل شرح الأستاذ في القاعة أو ارفع ملفك الصوتي لتحويله لنص عربي دقيق وتلخيص
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {hasGeminiKey ? 'Gemini 3.5 Transcribe' : 'محرك التفريغ التعليمي'}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recording & Upload Options Card */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* 1. Live Mic Recorder */}
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-center space-y-4 flex flex-col items-center justify-center">
            <div className="text-xs font-semibold text-slate-300">
              تسجيل صوتي مباشر للمحاضرة
            </div>

            <div className="relative">
              {isRecording && (
                <span className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
              )}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
                  isRecording
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950'
                }`}
              >
                {isRecording ? <Square className="w-7 h-7 fill-white" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            <div className="text-lg font-mono font-bold text-white">
              {isRecording ? formatTime(recordingSeconds) : '00:00'}
            </div>

            <div className="text-xs text-slate-400">
              {isRecording ? 'جارٍ التسجيل الصوتي... اضغط للإيقاف' : 'اضغط على زر الميكروفون لبدء التسجيل'}
            </div>
          </div>

          {/* 2. Upload Audio File or Demo */}
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-300">
                أو اختر ملفاً صوتياً مسجلاً مسبقاً
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                يدعم صيغ MP3, WAV, WebM, M4A حتى 25 ميغابايت
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              className="hidden"
            />

            <div className="space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>رفع ملف صوتي من الجهاز</span>
              </button>

              <button
                onClick={handleDemoLecture}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/20 flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>تجربة تسجيل محاضرة نموذجية</span>
              </button>
            </div>

            {audioUrl && (
              <div className="pt-2 border-t border-slate-800/80">
                <audio controls src={audioUrl} className="w-full h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Process button */}
        {(audioUrl || audioBase64) && (
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleTranscribe}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>جارٍ تفريغ المحاضرة وتحليلها...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>تفريغ الصوت وتلخيصه الآن</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Transcription Results Card */}
      {transcriptResult && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {transcriptResult.engine || 'المحرك الذكي'}
                </span>
                {transcriptResult.durationEstimate && (
                  <span className="text-xs text-slate-400">
                    المدة: {transcriptResult.durationEstimate}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {transcriptResult.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saved ? 'تم الحفظ' : 'حفظ في المكتبة'}</span>
              </button>

              <button
                onClick={() => onSendToSummarizer(transcriptResult.transcription)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold border border-teal-500/30 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>إرسال للتلخيص الشامل</span>
              </button>
            </div>
          </div>

          {/* Quick Summary Pill */}
          {transcriptResult.summary && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
              <span className="font-bold">خلاصة المحاضرة السريعة: </span>
              {transcriptResult.summary}
            </div>
          )}

          {/* Full Transcription Text */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300">
              النص المفرغ الكامل للمحاضرة:
            </h4>
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 leading-loose whitespace-pre-wrap font-arabic">
              {transcriptResult.transcription}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
