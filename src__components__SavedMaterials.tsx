import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  Trash2,
  Eye,
  FileText,
  HelpCircle,
  Layers,
  Mic,
  Tag,
  Download,
  Calendar,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { SavedMaterial } from '../types';

interface SavedMaterialsProps {
  materials: SavedMaterial[];
  onDeleteMaterial: (id: string) => void;
}

export const SavedMaterials: React.FC<SavedMaterialsProps> = ({
  materials,
  onDeleteMaterial,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<SavedMaterial | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === 'all' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: SavedMaterial['type']) => {
    switch (type) {
      case 'summary':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-sky-400" />;
      case 'flashcards':
        return <Layers className="w-4 h-4 text-teal-400" />;
      case 'transcription':
        return <Mic className="w-4 h-4 text-amber-400" />;
      default:
        return <Bookmark className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getTypeName = (type: SavedMaterial['type']) => {
    switch (type) {
      case 'summary':
        return 'ملخص دراسي';
      case 'quiz':
        return 'اختبار تجريبي';
      case 'flashcards':
        return 'بطاقات حفظ';
      case 'transcription':
        return 'تفريغ صوتي';
      default:
        return 'ملاحظة خاصة';
    }
  };

  const handleExportAll = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(materials, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zakir_bi_dhaka_saved_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-cyan-400" />
            المواد والمذكرات المحفوظة
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            مكتبتك الخاصة المخزنة بأمان في متصفحك المحلي للوصول السريع ومراجعة ما قمت بإنشائه
          </p>
        </div>

        {materials.length > 0 && (
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>تصدير مكتبتي كملف</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالعنوان، المادة، أو الوسم..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs w-full sm:w-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'summary', label: 'الملخصات' },
            { id: 'quiz', label: 'الاختبارات' },
            { id: 'note', label: 'الملاحظات' },
            { id: 'transcription', label: 'التفريغات' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                filterType === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-md group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {getIcon(item.type)}
                  <span>{getTypeName(item.type)}</span>
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.createdAt}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-2">
                {item.title}
              </h3>

              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[11px]">
                  {item.subject}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => setSelectedMaterial(item)}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>عرض المحتوى</span>
              </button>

              <button
                onClick={() => onDeleteMaterial(item.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                title="حذف من المحفوظات"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 space-y-3">
            <Bookmark className="w-10 h-10 mx-auto text-slate-600" />
            <div className="text-sm font-bold text-white">لا توجد مواد محفوظة مطابقة</div>
            <p className="text-xs">
              يمكنك حفظ أي ملخص، اختبار، أو ملاحظة بنقرة واحدة من داخل أدوات المنصة
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[85vh] flex flex-col justify-between animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {getIcon(selectedMaterial.type)}
                <h3 className="text-base font-bold text-white">{selectedMaterial.title}</h3>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed pr-1">
              {selectedMaterial.type === 'summary' && selectedMaterial.content && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-teal-400 block mb-1">نظرة عامة:</span>
                    {selectedMaterial.content.overview}
                  </div>
                  {selectedMaterial.content.mainPoints && (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <span className="font-bold text-cyan-400 block mb-1">الأفكار الرئيسية:</span>
                      {selectedMaterial.content.mainPoints.map((p: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-teal-400 font-bold">•</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedMaterial.type === 'note' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 whitespace-pre-wrap font-arabic">
                  {selectedMaterial.content?.text || JSON.stringify(selectedMaterial.content)}
                </div>
              )}

              {selectedMaterial.type === 'transcription' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 whitespace-pre-wrap font-arabic">
                  {selectedMaterial.content?.transcription || JSON.stringify(selectedMaterial.content)}
                </div>
              )}

              {selectedMaterial.type === 'quiz' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">
                    عدد أسئلة الاختبار المحفوظ: {selectedMaterial.content?.questions?.length || 0}
                  </div>
                  {selectedMaterial.content?.questions?.map((q: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="font-bold text-white mb-1">
                        {i + 1}. {q.question}
                      </div>
                      <div className="text-teal-300 text-xs">الإجابة الصحيحة: {q.correctAnswer}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-500">حُفظت في: {selectedMaterial.createdAt}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    let text = '';
                    if (selectedMaterial.type === 'summary' && selectedMaterial.content) {
                      text = `${selectedMaterial.title}\n\nنظرة عامة:\n${selectedMaterial.content.overview || ''}\n\nالأفكار:\n${(selectedMaterial.content.mainPoints || []).join('\n')}`;
                    } else if (selectedMaterial.type === 'note') {
                      text = selectedMaterial.content?.text || JSON.stringify(selectedMaterial.content);
                    } else if (selectedMaterial.type === 'transcription') {
                      text = selectedMaterial.content?.transcription || JSON.stringify(selectedMaterial.content);
                    } else {
                      text = JSON.stringify(selectedMaterial.content, null, 2);
                    }
                    navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ المحتوى'}</span>
                </button>

                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
