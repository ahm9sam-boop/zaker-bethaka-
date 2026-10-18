import React from 'react';
import { Logo } from './Logo';
import {
  Menu,
  X,
  Flame,
  Sparkles,
  Clock,
  BookOpen,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { DashboardTab } from '../types';

interface NavbarProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  hasGeminiKey: boolean;
  streakDays: number;
  studyMinutes: number;
  onOpenPomodoro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  mobileMenuOpen,
  setMobileMenuOpen,
  hasGeminiKey,
  streakDays,
  studyMinutes,
  onOpenPomodoro,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Right side: Mobile Menu Button & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div onClick={() => onTabChange('home')} className="cursor-pointer">
              <Logo size="md" />
            </div>
          </div>

          {/* Center: AI Engine status pill */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    hasGeminiKey ? 'bg-teal-400' : 'bg-emerald-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    hasGeminiKey ? 'bg-teal-500' : 'bg-emerald-500'
                  }`}
                ></span>
              </span>
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-300 font-medium">
                {hasGeminiKey ? 'Gemini 3.8 Flash مدعوم' : 'المحرك التعليمي الذكي (مفعل)'}
              </span>
            </div>
          </div>

          {/* Left side: Quick Stats, Streak & Study Timer */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Study Streak */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs sm:text-sm font-semibold select-none"
              title="أيام المذاكرة المتتالية"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{streakDays}</span>
              <span className="hidden sm:inline">أيام حماس</span>
            </div>

            {/* Total Minutes Studied */}
            <div
              onClick={onOpenPomodoro}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs sm:text-sm font-semibold hover:bg-teal-500/20 transition"
              title="ساعات المذاكرة المنجزة - انقر لبدء مؤقت بومودورو"
            >
              <Clock className="w-4 h-4 text-teal-400" />
              <span>{studyMinutes} د</span>
              <span className="hidden sm:inline">مذاكرة</span>
            </div>


            {/* Quick Action: Start AI Assistant */}
            <button
              onClick={() => onTabChange('assistant')}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>اسأل الذكاء</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
