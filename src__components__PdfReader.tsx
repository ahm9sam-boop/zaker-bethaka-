import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  Upload,
  BookOpen,
  FileText,
  Search,
  ChevronRight,
  ChevronLeft,
  Bot,
  HelpCircle,
  Sparkles,
  Layers,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  FileCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { SAMPLE_MATERIALS } from '../data/sampleContent';

interface PdfReaderProps {
  onSendToAssistant: (text: string) => void;
  onSendToSummarizer: (text: string) => void;
  onSendToQuiz: (text: string) => void;
  onSendToFlashcards: (text: string) => void;
}

const MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_TXT_SIZE_BYTES = 5 * 1024 * 1024;  // 5 MB
const MAX_PAGES_TO_PROCESS = 60; // Safe memory bound for in-browser extraction

export const PdfReader: React.FC<PdfReaderProps> = ({
  onSendToAssistant,
  onSendToSummarizer,
  onSendToQuiz,
  onSendToFlashcards,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [extractedPages, setExtractedPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [isScannedPdf, setIsScannedPdf] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(15);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeLoadingTaskRef = useRef<any>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Clean up object URLs and loading tasks on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (activeLoadingTaskRef.current) {
        try {
          activeLoadingTaskRef.current.destroy();
        } catch {
          // ignore
        }
        activeLoadingTaskRef.current = null;
      }
    };
  }, []);

  const resetReaderState = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (activeLoadingTaskRef.current) {
      try {
        activeLoadingTaskRef.current.destroy();
      } catch {
        // ignore
      }
      activeLoadingTaskRef.current = null;
    }
    setErrorMsg(null);
    setWarningMsg(null);
    setIsScannedPdf(false);
    setSearchQuery('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetReaderState();

    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
    const isTxt =
      file.type === 'text/plain' ||
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.text');

    // 1. File type validation
    if (!isPdf && !isTxt) {
      setErrorMsg(
        'صيغة الملف غير مدعومة. يدعم النظام حالياً ملفات PDF (.pdf) والملفات النصية (.txt). يُرجى تحويل المستند أو اختيار ملف متوافق.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. File size validation
    const maxAllowedSize = isPdf ? MAX_PDF_SIZE_BYTES : MAX_TXT_SIZE_BYTES;
    const maxMb = isPdf ? 15 : 5;
    if (file.size > maxAllowedSize) {
      const actualMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMsg(
        `حجم الملف المحدد (${actualMb} ميجابايت) يتجاوز الحد الأقصى المسموح به (${maxMb} ميجابايت). للمحافظة على أداء المتصفح وسرعة المعالجة، يُرجى تقسيم الملف إلى أجزاء أصغر أو رفع الفصول المطلوبة فقط.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFileName(file.name);
    setFileSize(
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(0)} كيلوبايت`
        : `${(file.size / (1024 * 1024)).toFixed(2)} ميجابايت`
    );
    setIsLoading(true);
    setLoadingProgress({ current: 0, total: 1 });

    try {
      if (isTxt) {
        // Process text file efficiently
        await processTextFile(file);
      } else {
        // Process PDF file efficiently with PDF.js
        await processPdfFile(file);
      }
    } catch (err: any) {
      console.error('[PdfReader] Processing error:', err);
      const isMemoryErr =
        err?.name === 'RangeError' ||
        err?.message?.toLowerCase().includes('memory') ||
        err?.message?.toLowerCase().includes('storage') ||
        err?.message?.toLowerCase().includes('allocation');

      if (isMemoryErr) {
        setErrorMsg(
          'حدث نقص في الذاكرة المتاحة للمتصفح أثناء معالجة هذا الملف. يُرجى إغلاق علامات التبويب غير المستخدمة أو تقسيم ملف PDF إلى صفحات أقل.'
        );
      } else {
        setErrorMsg(
          err?.message && typeof err.message === 'string' && !err.message.includes('[object')
            ? `تعذر استخراج النص: ${err.message}`
            : 'تعذر استخراج النص من المستند. قد يكون الملف تالفاً أو محمياً بكلمة مرور.'
        );
      }
      setExtractedPages([]);
      setNumPages(0);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const processTextFile = async (file: File) => {
    const rawText = await file.text();
    if (!rawText.trim()) {
      setErrorMsg('الملف النصي المرفوع فارغ ولا يحتوي على أي محتوى.');
      setExtractedPages([]);
      setNumPages(0);
      return;
    }

    // Chunk text into readable virtual pages of ~2,000 characters
    const PAGE_CHAR_LIMIT = 2000;
    const pages: string[] = [];
    const paragraphs = rawText.split(/\n\s*\n/);
    let currentPageText = '';

    for (const paragraph of paragraphs) {
      if (currentPageText.length + paragraph.length > PAGE_CHAR_LIMIT && currentPageText.length > 0) {
        pages.push(currentPageText.trim());
        currentPageText = paragraph + '\n\n';
      } else {
        currentPageText += paragraph + '\n\n';
      }
    }
    if (currentPageText.trim()) {
      pages.push(currentPageText.trim());
    }

    setExtractedPages(pages);
    setNumPages(pages.length);
    setCurrentPage(1);
  };

  const processPdfFile = async (file: File) => {
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) {
      throw new Error('مكتبة معالجة PDF قيد التحميل في المتصفح، يُرجى المحاولة مرة أخرى بعد ثوانٍ.');
    }

    // Read file into ArrayBuffer and pass as Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Create a loading task with memory-conscious settings
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
      disableAutoFetch: true,
      disableStream: false,
    });
    activeLoadingTaskRef.current = loadingTask;

    const pdf = await loadingTask.promise;
    const totalDocPages = pdf.numPages || 1;
    const pagesToRead = Math.min(totalDocPages, MAX_PAGES_TO_PROCESS);

    if (totalDocPages > MAX_PAGES_TO_PROCESS) {
      setWarningMsg(
        `المستند يحتوي على ${totalDocPages} صفحة. لتفادي استهلاك ذاكرة المتصفح، تمت قراءة أول ${MAX_PAGES_TO_PROCESS} صفحة فقط. يُنصح بتقسيم الكتب الضخمة إلى فصول منفصلة.`
      );
    }

    setNumPages(pagesToRead);
    setCurrentPage(1);
    setLoadingProgress({ current: 0, total: pagesToRead });

    const pagesText: string[] = [];
    let totalExtractedChars = 0;

    for (let i = 1; i <= pagesToRead; i++) {
      setLoadingProgress({ current: i, total: pagesToRead });

      const page = await pdf.getPage(i);
      try {
        const textContent = await page.getTextContent();
        let pageStr = '';

        if (textContent && Array.isArray(textContent.items)) {
          pageStr = textContent.items
            .map((item: any) => (typeof item?.str === 'string' ? item.str : ''))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        }

        if (pageStr.length > 0) {
          pagesText.push(pageStr);
          totalExtractedChars += pageStr.length;
        } else {
          pagesText.push('(هذه الصفحة عبارة عن صورة ممسوحة ضوئياً أو عنصر رسومي بدون نصوص قابلة للاستخراج)');
        }
      } finally {
        // CRITICAL: release individual page memory from worker & DOM immediately
        page.cleanup();
      }
    }

    // Check if this appears to be a scanned document without embedded text
    if (totalExtractedChars < pagesToRead * 15) {
      setIsScannedPdf(true);
    }

    setExtractedPages(pagesText);

    // Cleanup PDF resources to release memory
    try {
      pdf.cleanup();
      loadingTask.destroy();
    } catch {
      // ignore
    }
    activeLoadingTaskRef.current = null;
  };

  const handleLoadSampleBook = () => {
    resetReaderState();
    setFileName('كتاب الأحياء والوراثة - الفصل الثاني.pdf');
    setFileSize('1.4 MB');
    setNumPages(3);
    setCurrentPage(1);
    setExtractedPages([
      SAMPLE_MATERIALS[0].fullText,
      `تابع: الفصل الثاني - انقسام الخلية وعلم الوراثة

تنقسم الخلايا في الكائنات الحية بطريقتين رئيسيتين:
1. الانقسام المتساوي (Mitosis): يحدث في الخلايا الجسدية لتعويض الأنسجة التالفة والنمو، وينتج عنه خليتان متطابقتان وراثياً تحتويان على العدد الكامل من الكروموسومات (2n).
2. الانقسام الاختزالي (Meiosis): يحدث في الخلايا التناسلية لإنتاج الأمشاج (الحيوانات المنوية والبويضات)، وينتج عنه 4 خلايا غير متطابقة وراثياً تحتوي على نصف عدد الكروموسومات (1n).

قوانين مندل في الوراثة:
- قانون انعزال الصفات (Law of Segregation): تنفصل أليلات كل صفة وراثية عند تكوين الأمشاج.
- قانون التوزيع الحر (Law of Independent Assortment): تتوزع أزواج الأليلات المختلفة على الأمشاج بشكل مستقل عن بعضها البعض.`,
      `المصطلحات الوراثية وتطبيقات الهندسة الوراثية:

- الجين (Gene): تسلسل محدد من النيوكليوتيدات في جزئ DNA يحمل الشفرة لإنتاج بروتين معين.
- الصفة السائدة (Dominant Trait): صفة تظهر حتى بوجود نسخة واحدة من الأليل.
- الصفة المتنحية (Recessive Trait): صفة لا تظهر إلا عند اجتماع أليلين متنحيين.
- تقنية كريسبر (CRISPR-Cas9): أحدث تقنية لتعديل الجينات بدقة فائقة لعلاج الأمراض الوراثية المستعصية وتحسين المحاصيل الزراعية.`,
    ]);
  };

  const currentText = extractedPages[currentPage - 1] || '';

  const handleCopyCurrentPage = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Search inside document pages
  const searchResultsCount = searchQuery.trim()
    ? extractedPages.filter((p) => p.toLowerCase().includes(searchQuery.toLowerCase())).length
    : 0;

  const jumpToNextMatch = () => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    for (let i = currentPage; i < extractedPages.length; i++) {
      if (extractedPages[i].toLowerCase().includes(q)) {
        setCurrentPage(i + 1);
        return;
      }
    }
    // wrap around
    for (let i = 0; i < currentPage - 1; i++) {
      if (extractedPages[i].toLowerCase().includes(q)) {
        setCurrentPage(i + 1);
        return;
      }
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-teal-400" />
            قراءة وتحليل ملفات PDF والمستندات
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            استخرج النصوص من كتبك المدرسية وتصفحها وشاركها مباشرة مع أدوات الذكاء الاصطناعي (يدعم PDF و TXT حتى 15 ميجابايت)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,application/pdf,.txt,text/plain"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
          >
            <Upload className="w-4 h-4" />
            <span>رفع ملف (PDF أو TXT)</span>
          </button>

          <button
            onClick={handleLoadSampleBook}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm border border-slate-700 transition"
          >
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>تجربة كتاب تجريبي</span>
          </button>
        </div>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-rose-200">تعذر معالجة الملف</div>
            <div className="leading-relaxed">{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Warning Message Box */}
      {warningMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="leading-relaxed">{warningMsg}</div>
        </div>
      )}

      {/* Scanned Document OCR Warning */}
      {isScannedPdf && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 shadow-md">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-100">تنبيه: مستند ممسوح ضوئياً (صور ممسوحة)</div>
            <div className="leading-relaxed text-amber-200/90">
              يبدو أن هذا المستند عبارة عن صور ممسوحة ضوئياً (Scanned PDF) ولا يحتوي على طبقة نصوص رقمية مدمجة قابلة للاستخراج مباشرة.
              لتحليل هذا الملف يتطلب تقنية التعرف الضوئي على الحروف (OCR) لتحويل الصور إلى نصوص.
              يمكنك نسخ النص يدوياً أو تجربة رفع مستند PDF نصي أصلي.
            </div>
          </div>
        </div>
      )}

      {/* Upload Dropzone if no file loaded */}
      {!fileName && !isLoading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-teal-500/60 rounded-3xl p-10 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="p-4 rounded-3xl bg-slate-800 text-teal-400 group-hover:scale-110 group-hover:bg-teal-500/10 transition">
            <Upload className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="text-base font-bold text-white">
              اسحب وأفلت ملف PDF أو TXT هنا، أو انقر للاختيار من جهازك
            </div>
            <div className="text-xs text-slate-400">
              الحد الأقصى لحجم الملف: 15 ميجابايت لملفات PDF، و5 ميجابايت للملفات النصية
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLoadSampleBook();
            }}
            className="mt-2 text-xs text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-4"
          >
            أو اضغط هنا لتجربة نموذج كتاب أحياء معد مسبقاً
          </button>
        </div>
      )}

      {/* Loading state with live progress bar */}
      {isLoading && (
        <div className="p-10 text-center rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="w-12 h-12 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <div className="text-sm font-bold text-white">جارٍ قراءة صفحات المستند واستخراج النصوص بأمان...</div>
            {loadingProgress.total > 0 && (
              <div className="text-xs text-teal-300 font-mono">
                صفحة {loadingProgress.current} من {loadingProgress.total} (
                {Math.round((loadingProgress.current / loadingProgress.total) * 100)}%)
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {loadingProgress.total > 0 && (
            <div className="max-w-md mx-auto bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full transition-all duration-200"
                style={{
                  width: `${Math.round((loadingProgress.current / loadingProgress.total) * 100)}%`,
                }}
              />
            </div>
          )}

          <div className="text-[11px] text-slate-400">
            تتم معالجة المستند تدريجياً داخل ذاكرة المتصفح مع تحرير الموارد تلقائياً
          </div>
        </div>
      )}

      {/* Document Reader & Side Action Panel */}
      {fileName && !isLoading && numPages > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Document Content Viewer (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Viewer Toolbar */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span className="font-bold text-white truncate max-w-[180px] sm:max-w-xs">{fileName}</span>
                {fileSize && <span className="text-[11px] text-slate-400">({fileSize})</span>}
              </div>

              {/* Page Controls & Search */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search In Doc */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && jumpToNextMatch()}
                    placeholder="بحث في المستند..."
                    className="w-28 sm:w-36 pl-6 pr-2 py-1 text-[11px] rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <Search
                    onClick={jumpToNextMatch}
                    className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer hover:text-white"
                  />
                </div>
                {searchResultsCount > 0 && (
                  <span
                    onClick={jumpToNextMatch}
                    className="cursor-pointer text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono"
                    title="انقر للانتقال للنتيجة التالية"
                  >
                    {searchResultsCount} صفحات
                  </span>
                )}

                {/* Page Navigation */}
                <div className="flex items-center gap-1 border-r border-slate-700 pr-2 mr-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
                    title="الصفحة السابقة"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <span className="px-2 font-medium text-slate-300">
                    <span className="text-teal-400 font-bold">{currentPage}</span> / {numPages}
                  </span>

                  <button
                    disabled={currentPage >= numPages}
                    onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
                    title="الصفحة التالية"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Font Size Adjusters */}
                <div className="flex items-center gap-1 border-r border-slate-700 pr-2 mr-1">
                  <button
                    onClick={() => setFontSize((s) => Math.min(22, s + 1))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="تكبير الخط"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="تصغير الخط"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Content Canvas / Paper */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800 min-h-[450px] max-h-[600px] overflow-y-auto space-y-4 shadow-inner relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs text-slate-400">
                <span>نص الصفحة {currentPage} من {numPages}</span>
                <button
                  onClick={handleCopyCurrentPage}
                  className="flex items-center gap-1 hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ نص الصفحة'}</span>
                </button>
              </div>

              <div
                style={{ fontSize: `${fontSize}px` }}
                className="text-slate-200 leading-relaxed whitespace-pre-wrap select-text font-arabic"
              >
                {currentText || 'الصفحة فارغة أو تحتوي على صور غير نصية.'}
              </div>
            </div>
          </div>

          {/* Side AI Actions Panel (1 col) */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>إجراءات الذكاء الاصطناعي على المستند</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                استغل محتوى هذه الصفحة في بقية أدوات المنصة بضغطة زر واحدة:
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={() => onSendToAssistant(currentText)}
                  disabled={!currentText || isScannedPdf}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-850 hover:border-teal-500/50 border border-slate-700/80 disabled:opacity-40 transition group text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-110 transition">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-teal-300">
                        سؤال المساعد حول الصفحة
                      </div>
                      <div className="text-[10px] text-slate-400">
                        فتح المحادثة وسياق الصفحة مرفق
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onSendToSummarizer(currentText)}
                  disabled={!currentText || isScannedPdf}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-850 hover:border-indigo-500/50 border border-slate-700/80 disabled:opacity-40 transition group text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                        تلخيص محتوى الصفحة
                      </div>
                      <div className="text-[10px] text-slate-400">
                        استخراج أهم الأفكار والمصطلحات
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onSendToQuiz(currentText)}
                  disabled={!currentText || isScannedPdf}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-850 hover:border-cyan-500/50 border border-slate-700/80 disabled:opacity-40 transition group text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                        توليد اختبار تدريبي
                      </div>
                      <div className="text-[10px] text-slate-400">
                        إنشاء أسئلة اختيار من متعدد فورية
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onSendToFlashcards(currentText)}
                  disabled={!currentText || isScannedPdf}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-850 hover:border-emerald-500/50 border border-slate-700/80 disabled:opacity-40 transition group text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                        إنشاء بطاقات حفظ (Flashcards)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        تحويل المفاهيم إلى بطاقات 3D
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Document Info Card */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-300 flex items-center justify-between">
                <span>معلومات المستند</span>
                <button
                  onClick={() => {
                    resetReaderState();
                    setFileName(null);
                    setExtractedPages([]);
                    setNumPages(0);
                  }}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إغلاق المستند</span>
                </button>
              </div>
              <div>اسم الملف: <span className="text-white truncate block">{fileName}</span></div>
              <div>عدد الصفحات المستخرجة: <span className="text-teal-400 font-bold">{numPages}</span></div>
              <div>حجم النص الحالي: <span className="text-white">{currentText.length} حرف</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
