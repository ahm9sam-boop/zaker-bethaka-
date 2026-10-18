export type DashboardTab =
  | 'home'
  | 'assistant'
  | 'summarizer'
  | 'pdf_reader'
  | 'transcription'
  | 'mindmaps'
  | 'quizzes'
  | 'flashcards'
  | 'planner'
  | 'saved'
  | 'progress';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
  isLiveAi?: boolean;
}

export interface SummaryResult {
  title: string;
  overview: string;
  mainPoints: string[];
  definitions: { term: string; definition: string }[];
  examTips: string[];
  isAiGenerated?: boolean;
  engine?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false';
  options: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastered?: boolean;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindMapNode[];
  color?: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  estimatedMinutes: number;
}

export interface SavedMaterial {
  id: string;
  title: string;
  type: 'summary' | 'quiz' | 'flashcards' | 'note' | 'transcription';
  content: any;
  createdAt: string;
  subject: string;
  tags: string[];
}

export interface UserProgress {
  streakDays: number;
  totalStudyMinutes: number;
  quizzesTaken: number;
  averageQuizScore: number;
  cardsMastered: number;
  summariesCreated: number;
  tasksCompleted: number;
  dailyMinutes: { day: string; minutes: number }[];
}
