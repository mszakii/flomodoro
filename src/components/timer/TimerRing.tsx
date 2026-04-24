import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../lib/store';
import { cn } from '../../lib/utils';
import { playSound } from '../../lib/audio';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const PRESETS = [
  { icon: '🍬', label: 'Sweet', duration: 5 * 60 },
  { icon: '🥕', label: 'Carrot', duration: 15 * 60 },
  { icon: '🍎', label: 'Apple', duration: 25 * 60 },
  { icon: '🍰', label: 'Cake', duration: 45 * 60 },
  { icon: '🍱', label: 'Meal', duration: 60 * 60 }
];

export const TimerRing: React.FC = () => {
  const { state, startTimer, pauseTimer, skipSession, tickTimer, handleSessionComplete, resetTimer, updateSettings } = useAppStore();
  const { timerMode, timerStatus, timeLeft, sessionCount, settings } = state;
  const isRunning = timerStatus === 'running';

  const [selectedPreset, setSelectedPreset] = useState(2); // Default to Apple (25m)

  const totalDuration = settings[`${timerMode}Duration`];
  const progress = Math.min(1, Math.max(0, 1 - (timeLeft / totalDuration)));

  const size = 320;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const tickRef = useRef(tickTimer);
  tickRef.current = tickTimer;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        tickRef.current();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleCompleteRef = useRef(handleSessionComplete);
  handleCompleteRef.current = handleSessionComplete;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (timeLeft <= 0 && isRunning) {
      if (settings.soundEnabled) {
        playSound('chime');
      }
      timeout = setTimeout(() => {
        handleCompleteRef.current();
      }, 100);
    }
    return () => clearTimeout(timeout);
  }, [timeLeft, isRunning, settings.soundEnabled]);

  const selectPreset = (index: number) => {
    if (isRunning) return; 
    setSelectedPreset(index);
    updateSettings({ workDuration: PRESETS[index].duration });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      switch(e.key.toLowerCase()) {
        case ' ': // Spacebar
          e.preventDefault();
          if (isRunning) pauseTimer();
          else startTimer();
          break;
        case 'r':
          resetTimer();
          break;
        case 'n':
          skipSession();
          break;
        case 'arrowleft':
        case 'arrowup':
          e.preventDefault();
          selectPreset((selectedPreset - 1 + PRESETS.length) % PRESETS.length);
          break;
        case 'arrowright':
        case 'arrowdown':
          e.preventDefault();
          selectPreset((selectedPreset + 1) % PRESETS.length);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, pauseTimer, startTimer, resetTimer, skipSession, selectedPreset]);

  const modeColors = {
    work: 'text-rose-500',
    shortBreak: 'text-sky-500',
    longBreak: 'text-lavender-500',
  };
  
  const accentGradients = {
    work: ['#f43f5e', '#fb923c'],      // rose to orange
    shortBreak: ['#38bdf8', '#818cf8'], // sky to indigo
    longBreak: ['#a78bfa', '#e879f9'],  // purple to fuchsia
  };

  const currentGradient = accentGradients[timerMode];

  return (
    <div className="flex flex-col items-center justify-center relative w-full">
      {/* Preset Pickers */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 bg-black/5 dark:bg-white/5 p-2 rounded-2xl backdrop-blur-sm border border-white/10 max-w-full">
        {PRESETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => selectPreset(idx)}
            className={cn(
              "flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all relative overflow-hidden",
              selectedPreset === idx 
                ? "bg-white dark:bg-white/20 shadow-sm scale-110" 
                : "hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100"
            )}
          >
            <span className="text-lg sm:text-xl">{preset.icon}</span>
            <span className="text-[8px] sm:text-[9px] font-bold mt-0.5 opacity-60">
              {preset.duration / 60}m
            </span>
            {selectedPreset === idx && (
              <motion.div 
                layoutId="presetActive"
                className="absolute inset-0 border-2 border-rose-400 dark:border-rose-500 rounded-xl pointer-events-none"
              />
            )}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[360px] lg:h-[360px]">
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          className="absolute inset-0 transform -rotate-90 w-full h-full"
        >
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={currentGradient[0]} />
              <stop offset="100%" stopColor={currentGradient[1]} />
            </linearGradient>
            
            {/* Soft drop shadow for the ring */}
            <filter id="ringShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.2" floodColor={currentGradient[0]} />
            </filter>
          </defs>
          
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-black/5 dark:text-white/10"
          />
          
          {/* Progress Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="url(#timerGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            filter="url(#ringShadow)"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={timerMode}
            className="mb-2 px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60 backdrop-blur-md border border-white/10"
          >
            {timerMode === 'work' ? 'Focus' : timerMode === 'shortBreak' ? 'Short Break' : 'Long Break'} &middot; #{sessionCount + 1}
          </motion.div>
          
          <div className="text-6xl sm:text-7xl lg:text-8xl font-mono tracking-tight font-light text-slate-800 dark:text-slate-100 tabular-nums">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex items-center justify-center space-x-6">
        <button
          onClick={skipSession}
          className="p-3 bg-black/5 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-full transition-all hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 border border-transparent hover:border-black/5 dark:hover:border-white/10"
          title="Skip session"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-transform active:scale-90 hover:scale-105",
            timerMode === 'work' ? "bg-gradient-to-r from-rose-500 to-orange-400 shadow-rose-500/30" : 
            timerMode === 'shortBreak' ? "bg-gradient-to-r from-sky-400 to-indigo-400 shadow-sky-500/30" : 
            "bg-gradient-to-r from-fuchsia-400 to-purple-500 shadow-purple-500/30"
          )}
        >
          {isRunning ? (
            <svg className="w-8 h-8 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        
        <button
          onClick={resetTimer}
          className="p-3 bg-black/5 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-full transition-all hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 border border-transparent hover:border-black/5 dark:hover:border-white/10"
          title="Reset timer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};
