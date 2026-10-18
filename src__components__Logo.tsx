import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Visual Logo Mark: Book + Glowing Lightbulb */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 group cursor-pointer`}>
        {/* Glow ambient background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/40 via-cyan-400/30 to-amber-400/30 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300"></div>

        <svg
          viewBox="0 0 100 100"
          className="relative w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="bookCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="tealGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <linearGradient id="bulbGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
            <linearGradient id="bulbGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background Badge Frame */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="url(#bookCoverGrad)"
            stroke="url(#tealGlow)"
            strokeWidth="2.5"
          />

          {/* Open Book Base */}
          {/* Left Page */}
          <path
            d="M 50 68 C 40 64 28 64 18 69 L 18 42 C 28 37 40 37 50 42 Z"
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Right Page */}
          <path
            d="M 50 68 C 60 64 72 64 82 69 L 82 42 C 72 37 60 37 50 42 Z"
            fill="#F1F5F9"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Book Spine Center Line */}
          <line x1="50" y1="41" x2="50" y2="72" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />

          {/* Book Bottom Cover Trim */}
          <path
            d="M 16 71 C 28 66 40 66 50 71 C 60 66 72 66 84 71"
            stroke="#0EA5E9"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Lightbulb Aura Glow */}
          <circle cx="50" cy="33" r="16" fill="url(#bulbGlow)" />

          {/* Lightbulb Rays */}
          <line x1="50" y1="12" x2="50" y2="16" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="65" y1="18" x2="62" y2="21" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="35" y1="18" x2="38" y2="21" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="71" y1="33" x2="67" y2="33" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="29" y1="33" x2="33" y2="33" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />

          {/* Lightbulb Glass Body */}
          <path
            d="M 43 38 C 40 35 39 31 40 27 C 42 20 48 18 51 18 C 55 18 60 21 61 27 C 62 31 60 35 57 38 L 56 42 L 44 42 Z"
            fill="url(#bulbGold)"
            stroke="#B45309"
            strokeWidth="1.5"
          />

          {/* Lightbulb Filament */}
          <path
            d="M 47 29 C 47 25 53 25 53 29"
            stroke="#FFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Lightbulb Screw Base */}
          <rect x="45.5" y="42" width="9" height="2" rx="1" fill="#94A3B8" />
          <rect x="46.5" y="44.5" width="7" height="2" rx="1" fill="#64748B" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-white ${textSizes[size]}`}
              style={{ fontFamily: "'Alexandria', 'Cairo', sans-serif" }}
            >
              ذاكِر
            </span>
            <span
              className={`font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-300 bg-clip-text text-transparent ${textSizes[size]}`}
              style={{ fontFamily: "'Alexandria', 'Cairo', sans-serif" }}
            >
              بذكاء
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              ذكاء اصطناعي
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            المنصة الذكية للتعلم الفعال
          </span>
        </div>
      )}
    </div>
  );
};
