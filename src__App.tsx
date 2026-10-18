import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/DashboardHome';
import { AiAssistant } from './components/AiAssistant';
import { Summarizer } from './components/Summarizer';
import { PdfReader } from './components/PdfReader';
import { LectureTranscription } from './components/LectureTranscription';
import { MindMaps } from './components/MindMaps';
import { QuizGenerator } from './components/QuizGenerator';
import { FlashcardsView } from './components/FlashcardsView';
import { StudyPlanner } from './components/StudyPlanner';
import { SavedMaterials } from './components/SavedMaterials';
import { ProgressDashboard } from './components/ProgressDashboard';
import { DashboardTab, SavedMaterial, StudyTask, UserProgress } from './types';
import {
  INITIAL_SAVED_MATERIALS,
  INITIAL_TASKS,
  SAMPLE_MATERIALS,
} from './data/sampleContent';
import { safeStorageGet, safeStorageSet, sanitizeMaterialForStorage } from './utils/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<DashboardTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  // Cross-tab shared study text transfer
  const [sharedText, setSharedText] = useState<string>('');

  // Persisted state with quota protection
  const [savedMaterials, setSavedMaterials] = useState<SavedMaterial[]>(() =>
    safeStorageGet('zakir_saved_materials', INITIAL_SAVED_MATERIALS)
  );

  const [tasks, setTasks] = useState<StudyTask[]>(() =>
    safeStorageGet('zakir_study_tasks', INITIAL_TASKS)
  );

  const [progress, setProgress] = useState<UserProgress>(() =>
    safeStorageGet('zakir_user_progress', {
      streakDays: 5,
      totalStudyMinutes: 145,
      quizzesTaken: 4,
      averageQuizScore: 85,
      cardsMastered: 4,
      summariesCreated: 3,
      tasksCompleted: 2,
      dailyMinutes: [
        { day: 'السبت', minutes: 35 },
        { day: 'الأحد', minutes: 45 },
        { day: 'الاثنين', minutes: 20 },
        { day: 'الثلاثاء', minutes: 50 },
        { day: 'الأربعاء', minutes: 30 },
        { day: 'الخميس', minutes: 60 },
        { day: 'اليوم', minutes: 25 },
      ],
    })
  );

  // Check backend server status
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGeminiKey) {
          setHasGeminiKey(true);
        }
      })
      .catch((err) => {
        console.log('Status check fallback:', err);
      });
  }, []);

  // Safe local storage persistence with quota protection
  useEffect(() => {
    safeStorageSet('zakir_saved_materials', savedMaterials);
  }, [savedMaterials]);

  useEffect(() => {
    safeStorageSet('zakir_study_tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    safeStorageSet('zakir_user_progress', progress);
  }, [progress]);

  // Handlers for cross-tool workflows
  const handleSelectSample = (sampleId: string, targetTab: DashboardTab) => {
    const s = SAMPLE_MATERIALS.find((m) => m.id === sampleId);
    if (s) {
      setSharedText(s.fullText);
      setCurrentTab(targetTab);
    }
  };

  const handleSaveMaterial = (item: Omit<SavedMaterial, 'id' | 'createdAt'>) => {
    const sanitized = sanitizeMaterialForStorage(item);
    const newMaterial: SavedMaterial = {
      ...sanitized,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setSavedMaterials((prev) => [newMaterial, ...prev]);
  };

  const handleDeleteMaterial = (id: string) => {
    setSavedMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddStudyMinutes = (minutes: number) => {
    setProgress((prev) => {
      const updatedDaily = [...prev.dailyMinutes];
      const todayIdx = updatedDaily.length - 1;
      if (todayIdx >= 0) {
        updatedDaily[todayIdx].minutes += minutes;
      }
      return {
        ...prev,
        totalStudyMinutes: prev.totalStudyMinutes + minutes,
        dailyMinutes: updatedDaily,
      };
    });
  };

  const handleUpdateQuizProgress = (scorePercent: number) => {
    setProgress((prev) => {
      const newCount = prev.quizzesTaken + 1;
      const newAvg = Math.round(
        (prev.averageQuizScore * prev.quizzesTaken + scorePercent) / newCount
      );
      return {
        ...prev,
        quizzesTaken: newCount,
        averageQuizScore: newAvg,
      };
    });
  };

  const handleUpdateFlashcardProgress = (masteredCount: number) => {
    setProgress((prev) => ({
      ...prev,
      cardsMastered: Math.max(prev.cardsMastered, masteredCount),
    }));
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-arabic selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        hasGeminiKey={hasGeminiKey}
        streakDays={progress.streakDays}
        studyMinutes={progress.totalStudyMinutes}
        onOpenPomodoro={() => setCurrentTab('planner')}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Persistent Responsive Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          savedCount={savedMaterials.length}
          tasksPendingCount={pendingTasksCount}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 lg:mr-72 xl:mr-76">
          {currentTab === 'home' && (
            <DashboardHome
              onTabChange={setCurrentTab}
              onSelectSample={handleSelectSample}
              streakDays={progress.streakDays}
              studyMinutes={progress.totalStudyMinutes}
              completedTasksCount={tasks.length - pendingTasksCount}
              totalTasksCount={tasks.length}
              hasGeminiKey={hasGeminiKey}
            />
          )}

          {currentTab === 'assistant' && (
            <AiAssistant
              initialContext={sharedText}
              onSaveMaterial={handleSaveMaterial}
              hasGeminiKey={hasGeminiKey}
            />
          )}

          {currentTab === 'summarizer' && (
            <Summarizer
              initialText={sharedText}
              onSaveMaterial={handleSaveMaterial}
              onSendToQuiz={(text) => {
                setSharedText(text);
                setCurrentTab('quizzes');
              }}
              hasGeminiKey={hasGeminiKey}
            />
          )}

          {currentTab === 'pdf_reader' && (
            <PdfReader
              onSendToAssistant={(text) => {
                setSharedText(text);
                setCurrentTab('assistant');
              }}
              onSendToSummarizer={(text) => {
                setSharedText(text);
                setCurrentTab('summarizer');
              }}
              onSendToQuiz={(text) => {
                setSharedText(text);
                setCurrentTab('quizzes');
              }}
              onSendToFlashcards={(text) => {
                setSharedText(text);
                setCurrentTab('flashcards');
              }}
            />
          )}

          {currentTab === 'transcription' && (
            <LectureTranscription
              onSaveMaterial={handleSaveMaterial}
              onSendToSummarizer={(text) => {
                setSharedText(text);
                setCurrentTab('summarizer');
              }}
              hasGeminiKey={hasGeminiKey}
            />
          )}

          {currentTab === 'mindmaps' && (
            <MindMaps initialTopic={sharedText.slice(0, 50)} hasGeminiKey={hasGeminiKey} />
          )}

          {currentTab === 'quizzes' && (
            <QuizGenerator
              initialText={sharedText}
              onSaveMaterial={handleSaveMaterial}
              onUpdateQuizProgress={handleUpdateQuizProgress}
              hasGeminiKey={hasGeminiKey}
            />
          )}

          {currentTab === 'flashcards' && (
            <FlashcardsView
              initialText={sharedText}
              onSaveMaterial={handleSaveMaterial}
              onUpdateFlashcardProgress={handleUpdateFlashcardProgress}
              hasGeminiKey={hasGeminiKey}
            />
          )}

          {currentTab === 'planner' && (
            <StudyPlanner
              tasks={tasks}
              onUpdateTasks={setTasks}
              onAddStudyMinutes={handleAddStudyMinutes}
            />
          )}

          {currentTab === 'saved' && (
            <SavedMaterials
              materials={savedMaterials}
              onDeleteMaterial={handleDeleteMaterial}
            />
          )}

          {currentTab === 'progress' && <ProgressDashboard progress={progress} />}
        </main>
      </div>
    </div>
  );
}
