import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Sparkles,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  FileText,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { MindMapNode } from '../types';
import { SAMPLE_MATERIALS } from '../data/sampleContent';

interface MindMapsProps {
  initialTopic?: string;
  hasGeminiKey: boolean;
}

export const MindMaps: React.FC<MindMapsProps> = ({
  initialTopic = 'تركيب الخلية ووظائف العضيات الحيوية',
  hasGeminiKey,
}) => {
  const [topicInput, setTopicInput] = useState(initialTopic);
  const [isLoading, setIsLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);

  useEffect(() => {
    if (initialTopic) {
      setTopicInput(initialTopic);
    }
  }, [initialTopic]);

  const [mindMapData, setMindMapData] = useState<MindMapNode>({
    id: 'root',
    label: 'تركيب الخلية الحية',
    description: 'الوحدة البنائية والوظيفية الأساسية لكافة الكائنات الحية',
    children: [
      {
        id: 'c1',
        label: 'الغشاء البلازمي',
        description: 'غشاء شبه نفاذ ينظم دخول وخروج المواد والماء من وإلى الخلية',
        children: [
          { id: 'c1-1', label: 'طبقة فوسفوليبيد ثنائية', description: 'تمنح الغشاء مرونة وعزلاً مائياً' },
          { id: 'c1-2', label: 'بروتينات ناقلة وقنوات', description: 'تسمح بالمرور الانتقائي للأيونات والجزيئات' },
        ],
      },
      {
        id: 'c2',
        label: 'النواة والمادة الوراثية',
        description: 'غرفة التحكم المركزية التي تدير عمليات الانقسام وبناء البروتين',
        children: [
          { id: 'c2-1', label: 'الكروموسومات وحمض DNA', description: 'حفظ الشفرة الوراثية وتوريثها' },
          { id: 'c2-2', label: 'النوية (Nucleolus)', description: 'مركز تجميع الريبوسومات وإنتاجها' },
        ],
      },
      {
        id: 'c3',
        label: 'عضيات الطاقة والأيض',
        description: 'محطات توليد الطاقة وتصنيع المواد الغذائية',
        children: [
          { id: 'c3-1', label: 'الميتوكوندريا (ATP)', description: 'التنفس الخلوي وتوليد الطاقة' },
          { id: 'c3-2', label: 'البلاستيدات الخضراء', description: 'البناء الضوئي في الخلايا النباتية' },
          { id: 'c3-3', label: 'الريبوسومات وجهاز جولجي', description: 'تخليق وتعديل وتغليف البروتينات' },
        ],
      },
    ],
  });

  const handleGenerate = async (topicToUse?: string) => {
    const text = topicToUse || topicInput;
    if (!text.trim()) return;

    setIsLoading(true);
    setSelectedNode(null);

    try {
      const res = await fetch('/api/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicOrText: text }),
      });

      const data = await res.json();
      if (data.tree) {
        setMindMapData(data.tree);
      }
    } catch (err) {
      console.error('MindMap error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOutline = () => {
    const renderTextNode = (node: MindMapNode, level: number = 0): string => {
      const indent = '  '.repeat(level);
      let str = `${indent}• ${node.label}${node.description ? `: ${node.description}` : ''}\n`;
      if (node.children) {
        node.children.forEach((c) => {
          str += renderTextNode(c, level + 1);
        });
      }
      return str;
    };

    const outline = renderTextNode(mindMapData);
    navigator.clipboard.writeText(outline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [newSubLabel, setNewSubLabel] = useState('');
  const [isAddingSub, setIsAddingSub] = useState(false);

  const handleAddChild = (parentId: string) => {
    if (!newSubLabel.trim()) return;

    const addRecursive = (node: MindMapNode): MindMapNode => {
      if (node.id === parentId) {
        const newChild: MindMapNode = {
          id: `custom-${Date.now()}`,
          label: newSubLabel.trim(),
          description: 'فرع مضاف يدوياً بواسطة الطالب',
        };
        return {
          ...node,
          children: [...(node.children || []), newChild],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addRecursive),
        };
      }
      return node;
    };

    setMindMapData((prev) => addRecursive(prev));
    setNewSubLabel('');
    setIsAddingSub(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <GitFork className="w-6 h-6 text-purple-400" />
            الخرائط الذهنية التفاعلية
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            نظم الأفكار المعقدة في تسلسل بصري يربط الفروع بالأصول لترسيخ الحفظ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyOutline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم نسخ المخطط' : 'نسخ المخطط النصي'}</span>
          </button>
        </div>
      </div>

      {/* Generator Input Bar */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            نماذج خرائط جاهزة:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_MATERIALS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  setTopicInput(sample.title);
                  handleGenerate(sample.title);
                }}
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
            placeholder="اكتب عنوان الموضوع أو الدرس لإنشاء خريطته الذهنية..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500 transition"
          />

          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || !topicInput.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جارٍ بناء الهيكل الشجري...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>إنشاء الخريطة الذهنية</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas Viewport Area */}
      <div className="relative rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden min-h-[500px] shadow-2xl flex flex-col justify-between">
        {/* Floating Zoom & Controls Bar */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono px-2 text-slate-400">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="إعادة ضبط"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Node Details Floating Tooltip */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 max-w-sm p-4 rounded-2xl bg-slate-900/95 border border-purple-500/40 backdrop-blur-md shadow-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                تفاصيل المفهوم
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-sm font-bold text-white">{selectedNode.label}</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedNode.description || 'لا يوجد شرح إضافي لهذا الفرع.'}
            </p>

            {/* Add Sub-branch Action */}
            <div className="pt-2 border-t border-slate-800/80">
              {isAddingSub ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newSubLabel}
                    onChange={(e) => setNewSubLabel(e.target.value)}
                    placeholder="اسم الفرع الفرعي الجديد..."
                    className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setIsAddingSub(false)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 text-slate-300"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => handleAddChild(selectedNode.id)}
                      className="px-3 py-1 text-[11px] rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingSub(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/20 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة فرع متفرع من هذا المفهوم</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Visual Mind Map Tree Hierarchy */}
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          className="p-8 sm:p-12 transition-transform duration-200 overflow-x-auto min-w-[700px] flex flex-col items-center space-y-10"
        >
          {/* Root Central Node */}
          <div
            onClick={() => setSelectedNode(mindMapData)}
            className="group cursor-pointer px-6 py-4 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-xl shadow-purple-900/30 border-2 border-purple-400/50 hover:scale-105 transition-all text-center max-w-md relative"
          >
            <div className="text-[10px] uppercase font-bold tracking-widest text-purple-200 mb-0.5">
              المحور الرئيسي
            </div>
            <div className="text-base sm:text-lg font-extrabold">{mindMapData.label}</div>
            {mindMapData.description && (
              <div className="text-xs text-purple-100/90 mt-1 line-clamp-2">
                {mindMapData.description}
              </div>
            )}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-400 shadow" />
          </div>

          {/* First Level Branches */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-5xl">
            {mindMapData.children?.map((branch, bIdx) => {
              const borderColors = [
                'border-teal-500/50 hover:border-teal-400',
                'border-cyan-500/50 hover:border-cyan-400',
                'border-amber-500/50 hover:border-amber-400',
                'border-pink-500/50 hover:border-pink-400',
              ];
              const tagBg = [
                'bg-teal-500/20 text-teal-300',
                'bg-cyan-500/20 text-cyan-300',
                'bg-amber-500/20 text-amber-300',
                'bg-pink-500/20 text-pink-300',
              ];

              return (
                <div key={branch.id || bIdx} className="space-y-4 flex flex-col items-center">
                  {/* Branch Main Header Node */}
                  <div
                    onClick={() => setSelectedNode(branch)}
                    className={`w-full p-4 rounded-2xl bg-slate-900 border ${borderColors[bIdx % 4]} shadow-lg cursor-pointer hover:-translate-y-1 transition text-right group relative`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagBg[bIdx % 4]}`}>
                        فرع {bIdx + 1}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                      {branch.label}
                    </div>
                    {branch.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {branch.description}
                      </p>
                    )}
                  </div>

                  {/* Sub-branches / Leaves */}
                  {branch.children && (
                    <div className="w-full space-y-2.5 pr-4 border-r-2 border-slate-800">
                      {branch.children.map((sub, sIdx) => (
                        <div
                          key={sub.id || sIdx}
                          onClick={() => setSelectedNode(sub)}
                          className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition text-right group"
                        >
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">
                            • {sub.label}
                          </div>
                          {sub.description && (
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                              {sub.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span>💡 انقر على أي فرع أو عقدة لعرض شرحها وتفاصيلها الكاملة</span>
        </div>
      </div>
    </div>
  );
};
