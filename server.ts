import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Shared server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Local educational fallback generators (for demo/offline/no-key mode)
function generateLocalSummary(text: string) {
  const cleanText = text.trim();
  const title = cleanText.split('\n')[0]?.substring(0, 50) || 'ملخص المادة التعليمية';
  return {
    title: `ملخص: ${title}`,
    overview: `يقدم هذا المحتوى ملخصاً تعليمياً مركزاً للمادة المدخلة مع التركيز على أهم النقاط المعرفية والمفاهيم الأساسية التي يحتاجها الطالب للتحصيل الدراسي العالي.`,
    mainPoints: [
      'فهم المفاهيم الجوهرية والتمييز بين القواعد الأساسية والتطبيقات العملية.',
      'ربط العناصر المختلفة ببعضها لتعزيز الحفظ طويل المدى واستيعاب السياق.',
      'التركيز على الكلمات المفتاحية الأكثر تكراراً في الامتحانات والمراجعات الدورية.',
      'تطبيق مهارة الاسترجاع النشط والتكرار المتباعد لتثبيت المعلومات.',
    ],
    definitions: [
      {
        term: 'المفهوم المحوري',
        definition: 'الفكرة الأساسية التي بنيت عليها المادة وتتفرع منها باقي التفاصيل والتطبيقات.',
      },
      {
        term: 'الاسترجاع النشط',
        definition: 'تقنية استذكار تعتمد على استدعاء المعلومات من الذاكرة ذاتياً بدلاً من مجرد إعادة القراءة السلبية.',
      },
      {
        term: 'التطبيق العملي',
        definition: 'إسقاط النظريات والقوانين على أمثلة ومسائل نموذجية لتحقيق الفهم الشامل.',
      },
    ],
    examTips: [
      'راجع هذا الملخص قبل النوم لتثبيت الروابط العصبية للمعلومة.',
      'حوّل كل نقطة رئيسية إلى سؤال اختباري واختبر نفسك به.',
      'ركّز على الفروق الدقيقة بين المصطلحات المتشابهة لتفادي أخطاء الاختيارات.',
    ],
    isAiGenerated: false,
    engine: 'المحرك التعليمي المحلي (Smart Local Engine)',
  };
}

function generateLocalQuiz(topicOrText: string, count: number = 4) {
  return [
    {
      id: 'q-1',
      question: `ما هو العامل الأكثر أهمية لتعزيز الفهم العميق في موضوع "${topicOrText.slice(0, 35)}..."؟`,
      type: 'mcq',
      options: [
        'الاسترجاع النشط وربط المعلومات بالأمثلة الواقعية',
        'القراءة السريعة دون تلخيص',
        'حفظ الكلمات دون فهم المعنى العام',
        'تأجيل المذاكرة إلى ليلة الامتحان',
      ],
      correctAnswer: 'الاسترجاع النشط وربط المعلومات بالأمثلة الواقعية',
      explanation: 'الاسترجاع النشط يعزز الوصلات العصبية ويضمن ثبات المعلومة في الذاكرة طويلة المدى وفق أحدث أبحاث التعلم.',
    },
    {
      id: 'q-2',
      question: 'تقنية الخرائط الذهنية تساعد الدماغ على تنظيم الأفكار المعقدة في تسلسل بصري مترابط.',
      type: 'true_false',
      options: ['صحيح', 'خطأ'],
      correctAnswer: 'صحيح',
      explanation: 'تعتمد الخرائط الذهنية على المحفزات البصرية كالألوان والتشعبات مما يسهل معالجة الدماغ للمعلومات.',
    },
    {
      id: 'q-3',
      question: 'ما هي الطريقة المثلى لمراجعة المصطلحات والتعريفات قبل الاختبار؟',
      type: 'mcq',
      options: [
        'استخدام البطاقات التعليمية التفاعلية والتكرار المتباعد',
        'قراءة الكتاب كاملاً مرة واحدة بصمت',
        'تجاهل المصطلحات غير المفهومة',
        'الاعتماد فقط على التخمين',
      ],
      correctAnswer: 'استخدام البطاقات التعليمية التفاعلية والتكرار المتباعد',
      explanation: 'البطاقات التعليمية تطبق التكرار المتباعد الذي يعد أقوى أسلوب معتمد لتثبيت المصطلحات.',
    },
    {
      id: 'q-4',
      question: 'التلخيص الفعال يعني نسخ النصوص حرفياً من الكتاب المدرسي دون إعادة صياغة.',
      type: 'true_false',
      options: ['صحيح', 'خطأ'],
      correctAnswer: 'خطأ',
      explanation: 'التلخيص الجيد يعتمد على استيعاب الفكرة وإعادة صياغتها بأسلوبك الخاص مع التركيز على النقاط الجوهرية فقط.',
    },
  ].slice(0, Math.max(2, count));
}

function generateLocalFlashcards(topicOrText: string) {
  const shortTitle = topicOrText.trim().slice(0, 30) || 'المفاهيم العامة';
  return [
    {
      id: 'fc-1',
      front: `ما هي الفكرة الجوهرية وراء: ${shortTitle}؟`,
      back: 'فهم وتطبيق القواعد الأساسية مع تقسيم المادة إلى أجزاء أصغر يسهل استيعابها ومراجعتها بانتظام.',
      category: 'مفاهيم تأسيسية',
      difficulty: 'easy',
    },
    {
      id: 'fc-2',
      front: 'ما المقصود بتقنية التكرار المتباعد (Spaced Repetition)؟',
      back: 'مراجعة المادة على فترات زمنية متزايدة لمنع نسيانها وإبقائها في الذاكرة الدائمة.',
      category: 'طرق التعلم',
      difficulty: 'medium',
    },
    {
      id: 'fc-3',
      front: 'كيف يمكن تطبيق طريقة فاينمان في الشرح؟',
      back: 'شرح الموضوع المعقد بمصطلحات بسيطة جداً كأنك تشرحه لطفل في العاشرة، لتحديد الثغرات في فهمك الذاتي.',
      category: 'تقنيات الفهم',
      difficulty: 'hard',
    },
    {
      id: 'fc-4',
      front: 'ما هو دور التغذية الراجعة الفورية في الاختبارات التجريبية؟',
      back: 'تحديد نقاط الضعف فوراً وتصحيح المفاهيم الخاطئة قبل خوض الاختبار الحقيقي.',
      category: 'استراتيجيات الاختبار',
      difficulty: 'medium',
    },
  ];
}

function generateLocalMindMap(topic: string) {
  const title = topic.trim().slice(0, 30) || 'موضوع الدرس';
  return {
    id: 'root',
    label: title,
    description: 'المحور الرئيسي للموضوع',
    children: [
      {
        id: 'node-1',
        label: 'المفاهيم التأسيسية',
        description: 'المبادئ والقواعد الأساسية التي يبنى عليها المحتوى',
        children: [
          { id: 'node-1-1', label: 'التعريف الشامل', description: 'تحديد المعنى الدقيق وحدود المفهوم' },
          { id: 'node-1-2', label: 'المصطلحات المحورية', description: 'المفردات المفتاحية المستخدمة' },
        ],
      },
      {
        id: 'node-2',
        label: 'الآليات والخطوات',
        description: 'طريقة العمل والتسلسل المنطقي',
        children: [
          { id: 'node-2-1', label: 'المرحلة الأولى: التحضير', description: 'جمع البيانات وتجهيز المتطلبات' },
          { id: 'node-2-2', label: 'المرحلة الثانية: التنفيذ', description: 'تطبيق القواعد ومراعاة الشروط' },
          { id: 'node-2-3', label: 'المرحلة الثالثة: التقييم', description: 'مراجعة النتائج واستخراج الدروس' },
        ],
      },
      {
        id: 'node-3',
        label: 'التطبيقات العملية',
        description: 'نماذج واقعية ومسائل تدريبية',
        children: [
          { id: 'node-3-1', label: 'أمثلة محلولة', description: 'خطوة بخطوة للحل النموذجي' },
          { id: 'node-3-2', label: 'أسئلة شائعة في الامتحانات', description: 'أبرز الأسئلة المتكررة وطرق التعامل معها' },
        ],
      },
    ],
  };
}

// 1. Status API
app.get('/api/status', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'online',
    appName: 'ذاكر بذكاء',
    hasGeminiKey: isKeyConfigured,
    model: isKeyConfigured ? 'gemini-3.8-flash' : 'smart-local-engine',
    version: '1.0.0',
    capabilities: [
      'AI Study Chat',
      'Smart Summarizer',
      'PDF Text Reader & Extractor',
      'Audio & Lecture Transcription',
      'Mind Map Visualizer',
      'Quiz Generator',
      'Spaced Flashcards',
      'Study Task Planner',
    ],
  });
});

// 2. Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, studyContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'الرجاء إرسال رسائل المحادثة' });
    }

    const ai = getGeminiClient();
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    if (ai) {
      try {
        const systemPrompt = `أنت المساعد التعليمي الذكي في تطبيق "ذاكر بذكاء".
هدفك: مساعدة الطلاب والباحثين بأسلوب تعليمي مشجع، دقيق ومبسط باللغة العربية الفصحى.
القواعد:
- اشرح المفاهيم المعقدة خطوة بخطوة مع أمثلة واضحة.
- استخدم التنسيق المنظم والنقاط والأرقام عند اللزوم.
- شجع الطالب دائماً على التحصيل والتفكير النقدي.
${studyContext ? `سياق المادة الدراسية الحالية التي يدرسها الطالب:\n${studyContext}\nاستند إلى هذا السياق في الإجابة عند ارتباطه بالسؤال.` : ''}`;

        const contents = messages.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
          },
        });

        return res.json({
          reply: response.text || 'عذراً، لم أتمكن من تكوين إجابة كاملة.',
          source: 'gemini-3.8-flash',
          isLiveAi: true,
        });
      } catch (geminiError: any) {
        console.error('Gemini Chat error, fallbacking to smart local:', geminiError);
      }
    }

    // Local smart response fallback
    let fallbackReply = `أهلاً بك! بصفتي مساعدك في "ذاكر بذكاء"، قرأت سؤالك حول "${lastUserMessage.slice(0, 40)}...".
    
إليك أهم النقاط التوجيهية حول هذا الموضوع:
1. **الفهم الأولي**: قسّم السؤال أو المسألة إلى مدخلات ومطلوب لتسهيل الحل.
2. **الربط المعرفي**: تذكّر القوانين والمصطلحات المرتبطة بهذا الدرس.
3. **التطبيق**: جرب حل نموذج بسيط أولاً قبل الانتقال للمسائل الأكثر تعقيداً.
4. **نصيحة ذهبية**: يمكنك استخدام أداة "توليد الاختبارات" في القائمة للتأكد من مدى إتقانك لهذه النقطة تحديداً!

هل ترغب في توضيح جزئية معينة بالتفصيل أو ترغب في صياغة تلخيص سريع؟`;

    if (studyContext) {
      fallbackReply += `\n\n(ملاحظة: يمكنك الاستعانة بالنص الذي قمت بتحميله في مساحة العمل لتحقيق أقصى استفادة).`;
    }

    return res.json({
      reply: fallbackReply,
      source: 'smart-local-engine',
      isLiveAi: false,
    });
  } catch (err: any) {
    console.error('Server chat error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة المحادثة' });
  }
});

// 3. Summarize API
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, style = 'detailed', length = 'medium' } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'الرجاء إدخال نص التلخيص' });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `أنت خبير تعليمي وأكاديمي في تلخيص المناهج والمحاضرات.
قم بتلخيص النص التالي باللغة العربية بأسلوب تعليمي متقن ومحكم.
نوع التلخيص: ${style === 'bullets' ? 'نقاط مركزة فقط' : style === 'comprehensive' ? 'شامل ومفصل' : 'متوازن ومثالي للمراجعة'}.
طول التلخيص: ${length}.

النص المراد تلخيصه:
"""${text}"""

المخرجات المطلوبة كـ JSON صالح ومكتمل يحتوي الخصائص التالية:
{
  "title": "عنوان جذاب ومعبر للدرس أو الموضوع",
  "overview": "نظرة عامة وشرح موجز للأهمية (فقرة إلى فقرتين)",
  "mainPoints": ["نقطة رئيسية 1", "نقطة رئيسية 2", "نقطة رئيسية 3", "نقطة رئيسية 4"],
  "definitions": [
    {"term": "المصطلح 1", "definition": "تعريفه الدقيق والمبسط"},
    {"term": "المصطلح 2", "definition": "تعريفه الدقيق والمبسط"}
  ],
  "examTips": ["نصيحة للاختبار 1", "نصيحة للاختبار 2"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const jsonText = response.text?.trim() || '';
        const parsed = JSON.parse(jsonText);
        return res.json({
          ...parsed,
          isAiGenerated: true,
          engine: 'Gemini 3.8 Flash',
        });
      } catch (geminiError) {
        console.error('Gemini Summarize error, using fallback:', geminiError);
      }
    }

    // Fallback
    const local = generateLocalSummary(text);
    return res.json(local);
  } catch (err: any) {
    console.error('Summarize error:', err);
    res.status(500).json({ error: 'حدث خطأ في عملية التلخيص' });
  }
});

// 4. Quiz Generator API
app.post('/api/quiz', async (req, res) => {
  try {
    const { topicOrText, count = 4, difficulty = 'medium', type = 'mixed' } = req.body;
    if (!topicOrText || typeof topicOrText !== 'string' || topicOrText.trim().length === 0) {
      return res.status(400).json({ error: 'الرجاء تحديد موضوع أو نص الاختبار' });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `أنت أستاذ أكاديمي خبير في بناء الاختبارات والتقييمات التربوية.
قم بإنشاء اختبار تعليمي تفاعلي باللغة العربية حول المحتوى التالي:
"${topicOrText}"

المعايير:
- عدد الأسئلة: ${count}
- مستوى الصعوبة: ${difficulty} (سهل، متوسط، متقدم)
- نوع الأسئلة: ${type === 'mcq' ? 'اختيار من متعدد فقط' : type === 'true_false' ? 'صح أو خطأ فقط' : 'مزيج بين اختيار من متعدد وصح أو خطأ'}
- لكل سؤال يجب كتابة تفسير تعليمي واضح لماذا الإجابة صحيحة.

أعد النتيجة بتنسيق JSON حصراً:
[
  {
    "id": "q-1",
    "question": "نص السؤال الواضح والدقيق؟",
    "type": "mcq", // أو "true_false"
    "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"], // للصح والخطأ: ["صحيح", "خطأ"]
    "correctAnswer": "الخيار الصحيح بالضبط من بين الخيارات",
    "explanation": "شرح تربوي مبسط لسبب صحة هذا الخيار"
  }
]`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const jsonText = response.text?.trim() || '[]';
        const parsed = JSON.parse(jsonText);
        return res.json({
          questions: Array.isArray(parsed) ? parsed : (parsed.questions || []),
          isAiGenerated: true,
          engine: 'Gemini 3.8 Flash',
        });
      } catch (geminiError) {
        console.error('Gemini Quiz error, using fallback:', geminiError);
      }
    }

    const localQuiz = generateLocalQuiz(topicOrText, Number(count) || 4);
    return res.json({
      questions: localQuiz,
      isAiGenerated: false,
      engine: 'المحرك التعليمي المحلي',
    });
  } catch (err: any) {
    console.error('Quiz error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء توليد الاختبار' });
  }
});

// 5. Flashcards API
app.post('/api/flashcards', async (req, res) => {
  try {
    const { topicOrText, count = 4 } = req.body;
    if (!topicOrText || typeof topicOrText !== 'string' || topicOrText.trim().length === 0) {
      return res.status(400).json({ error: 'الرجاء إدخال الموضوع أو النص للبطاقات' });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `أنشئ مجموعة بطاقات تعليمية تفاعلية (Flashcards) باللغة العربية حول الموضوع التالي:
"${topicOrText}"
عدد البطاقات: ${count}.
البطاقات يجب أن تغطي أهم المفاهيم، التعاريف، والأسئلة المفتاحية للمذاكرة الفعالة.

نسق الرد كـ JSON صالح ومباشر:
[
  {
    "id": "fc-1",
    "front": "السؤال أو المفهوم على وجه البطاقة؟",
    "back": "الإجابة الوافية والمركزة على ظهر البطاقة",
    "category": "تصنيف فرعي للمفهوم",
    "difficulty": "easy" // أو "medium" أو "hard"
  }
]`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const jsonText = response.text?.trim() || '[]';
        const parsed = JSON.parse(jsonText);
        return res.json({
          cards: Array.isArray(parsed) ? parsed : (parsed.cards || []),
          isAiGenerated: true,
          engine: 'Gemini 3.8 Flash',
        });
      } catch (geminiError) {
        console.error('Gemini Flashcards error, using fallback:', geminiError);
      }
    }

    const localCards = generateLocalFlashcards(topicOrText);
    return res.json({
      cards: localCards,
      isAiGenerated: false,
      engine: 'المحرك التعليمي المحلي',
    });
  } catch (err: any) {
    console.error('Flashcards error:', err);
    res.status(500).json({ error: 'حدث خطأ في توليد البطاقات التعليمية' });
  }
});

// 6. Mind Map API
app.post('/api/mindmap', async (req, res) => {
  try {
    const { topicOrText } = req.body;
    if (!topicOrText || typeof topicOrText !== 'string' || topicOrText.trim().length === 0) {
      return res.status(400).json({ error: 'الرجاء إدخال موضوع الخريطة الذهنية' });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `أنت خبير في هندسة المعرفة وتصميم الخرائط الذهنية التربوية.
قم ببناء هيكل شجري لخريطة ذهنية متكاملة باللغة العربية حول الموضوع التالي:
"${topicOrText}"

المتطلبات:
- جذر رئيسي (العنوان الأساسي)
- 3 إلى 4 فروع رئيسية متفرعة
- كل فرع رئيسي يحتوي على 2 إلى 3 فروع فرعية محددة ومفيدة للطلاب.

أعد النتيجة بتنسيق JSON شجري حصراً:
{
  "id": "root",
  "label": "عنوان الموضوع الرئيسي",
  "description": "وصف مختصر للمحور العام",
  "children": [
    {
      "id": "node-1",
      "label": "الفرع الأول",
      "description": "شرح الفرع",
      "children": [
        {"id": "node-1-1", "label": "فرع فرعي 1", "description": "توضيح مختصر"},
        {"id": "node-1-2", "label": "فرع فرعي 2", "description": "توضيح مختصر"}
      ]
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const jsonText = response.text?.trim() || '{}';
        const parsed = JSON.parse(jsonText);
        return res.json({
          tree: parsed,
          isAiGenerated: true,
          engine: 'Gemini 3.8 Flash',
        });
      } catch (geminiError) {
        console.error('Gemini MindMap error, using fallback:', geminiError);
      }
    }

    const localTree = generateLocalMindMap(topicOrText);
    return res.json({
      tree: localTree,
      isAiGenerated: false,
      engine: 'المحرك التعليمي المحلي',
    });
  } catch (err: any) {
    console.error('Mindmap error:', err);
    res.status(500).json({ error: 'حدث خطأ في إنشاء الخريطة الذهنية' });
  }
});

// 7. Audio / Lecture Transcription API
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/mp3', title = 'تسجيل المحاضرة' } = req.body;
    const ai = getGeminiClient();

    if (ai && audioBase64) {
      try {
        const audioPart = {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64,
          },
        };

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              audioPart,
              {
                text: 'فرغ هذا التسجيل الصوتي التعليمي بالكامل بدقة عالية وباللغة العربية الفصحى، مع تقسيم الكلام إلى فقرات ذات عناوين واضحة.',
              },
            ],
          },
        });

        const fullText = response.text || '';
        return res.json({
          title,
          transcription: fullText,
          summary: 'تم التفريغ الصوتي بنجاح باستخدام نموذج Gemini 3.5 Transcribe المتخصص في معالجة الصوتيات.',
          isAiGenerated: true,
          engine: 'Gemini 3.5 Transcribe',
          durationEstimate: 'تم التعرف آلياً',
        });
      } catch (geminiAudioError) {
        console.error('Gemini Audio error, using simulated lecture transcription:', geminiAudioError);
      }
    }

    // Demo / Simulated transcription mode
    return res.json({
      title: title || 'محاضرة تعليمية نموذجية',
      transcription: `السلام عليكم ورحمة الله وبركاته، مرحباً بكم في هذه المحاضرة التعليمية.
اليوم سنتناول المحاور الأساسية لتنظيم الوقت والاستيعاب المفاهيمي للمواد العلمية والنظرية.

أولاً: تقسيم وقت الدراسة إلى جلسات مركزة مدتها 25 إلى 30 دقيقة، مع استراحة قصيرة مدتها 5 دقائق، والمعروفة بتقنية بومودورو.
ثانياً: بعد القراءة الأولى لأي فصل، لا تقم بإعادة قراءته فوراً، بل أغلق الكتاب وحاول كتابة خريطة ذهنية أو تلخيص النقاط من ذاكرتك.
ثالثاً: حل الأسئلة السابقة والتطبيق العملي هو أفضل طريقة لتأكيد ثبات المعلومة واكتشاف أي فجوة في الفهم قبل موعد الامتحان النهائي.

نتمنى لجميع الطلاب التوفيق والنجاح الدائم في مسيرتهم الأكاديمية.`,
      summary: 'محاضرة شاملة تركز على: أساليب إدارة وقت المذاكرة، تقنية الاسترجاع النشط، وأهمية حل النماذج التدريبية لضمان التفوق الدراسي.',
      isAiGenerated: false,
      engine: 'تفريغ تعليمي تجريبي (المحرك المحلي)',
      durationEstimate: 'حوالي دقيقتين و30 ثانية',
    });
  } catch (err: any) {
    console.error('Transcribe error:', err);
    res.status(500).json({ error: 'حدث خطأ في تفريغ المحاضرة' });
  }
});

// Setup Vite middleware or static serving
async function setupServer() {
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

setupServer();
