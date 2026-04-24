import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { HistoryModal } from './HistoryModal';

const getTitle = (level: number) => {
  if (level < 5) return "Beginner";
  if (level < 20) return "Hard Worker";
  if (level < 50) return "Deep Diver";
  if (level < 100) return "Focus Master";
  return "Legendary Focus";
};

const formatSeconds = (secs: number) => {
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const StatsSidebar: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { state, setUserName } = useAppStore();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(state.userName);
  
  const { dailyStreak, focusStreak, secondHistory, bestDay, userName } = state;

  const todayStr = getTodayDateString();
  const todaySeconds = secondHistory[todayStr] || 0;
  const totalSeconds = (Object.values(secondHistory) as number[]).reduce((a: number, b: number) => a + b, 0);

  const totalMinutes = Math.floor(totalSeconds / 60);
  const currentLevel = Math.floor(totalMinutes / 60);
  const levelProgress = ((totalMinutes % 60) / 60) * 100;

  // Generate last 7 days chart
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const seconds = secondHistory[dateStr] || 0;
    days.push({ 
      day: d.toLocaleDateString('en-US', { weekday: 'short' })[0], 
      hours: seconds / 3600,
      dateStr 
    });
  }
  
  const maxHours = Math.max(0.1, ...days.map(d => d.hours));

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      setUserName(newName.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between p-6 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-white/50 dark:border-white/10 overflow-y-auto">
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100">FLOMO</h2>
            <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Studying Hub</div>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Activity History"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button 
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Greeting Section */}
        <div className="mb-8 px-2">
          <AnimatePresence mode="wait">
            {isEditingName ? (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleNameSubmit}
                className="flex items-center gap-2"
              >
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  className="bg-black/5 dark:bg-white/5 border-none rounded-lg px-3 py-1.5 text-sm font-bold w-full focus:ring-2 ring-rose-500"
                />
              </motion.form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer"
                onClick={() => setIsEditingName(true)}
              >
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Welcome back,
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-rose-500 transition-colors flex items-center gap-2 uppercase tracking-tight">
                  {userName} 
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-white/50 dark:bg-black/30 p-4 rounded-2xl border border-black/5 dark:border-white/5">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Level {currentLevel}</span>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{getTitle(currentLevel)}</span>
            </div>
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-3xl font-black text-slate-800 dark:text-white tabular-nums">{totalMinutes} <span className="text-xs font-bold text-slate-400 uppercase">min focus</span></span>
            </div>
            <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-rose-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-500/10 p-4 rounded-3xl flex flex-col border border-orange-500/20">
              <span className="text-xl mb-1">🔥</span>
              <span className="text-3xl font-black text-orange-600 dark:text-orange-400 tabular-nums">{dailyStreak}</span>
              <span className="text-[10px] text-orange-800/70 dark:text-orange-200/70 font-black uppercase tracking-widest">Streak</span>
            </div>
            <div className="bg-sky-500/10 p-4 rounded-3xl flex flex-col border border-sky-500/20">
              <span className="text-xl mb-1">🧠</span>
              <span className="text-3xl font-black text-sky-600 dark:text-sky-400 tabular-nums">{(totalSeconds / 3600).toFixed(1)}</span>
              <span className="text-[10px] text-sky-800/70 dark:text-sky-200/70 font-black uppercase tracking-widest">Total Hrs</span>
            </div>
          </div>

          <div className="space-y-4 px-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Today</span>
              <span className="font-black text-slate-800 dark:text-slate-200 tabular-nums">{formatSeconds(todaySeconds)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Sessions</span>
              <span className="font-black text-slate-800 dark:text-slate-200 tabular-nums">{focusStreak}</span>
            </div>
            {bestDay && (
              <div className="flex justify-between items-center text-sm pt-4 border-t border-black/5 dark:border-white/5">
                <span className="text-amber-500 font-black uppercase tracking-wider text-[10px] flex items-center gap-1">
                  ⭐ Record
                </span>
                <span className="font-black text-slate-800 dark:text-slate-200 tabular-nums">{formatSeconds(bestDay.seconds)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-1">Activity Chart</h4>
        <div className="flex justify-between items-end h-24 px-1">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className="w-full px-1.5 flex flex-col justify-end h-full">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.hours / maxHours) * 100}%` }}
                  className="w-full bg-slate-300 dark:bg-slate-600 rounded-full mb-3 min-h-[4px]"
                  style={{ opacity: d.hours > 0 ? 1 : 0.4 }}
                />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
