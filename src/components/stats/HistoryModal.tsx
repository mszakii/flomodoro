import React from 'react';
import { useAppStore } from '../../lib/store';
import { motion, AnimatePresence } from 'motion/react';

export const HistoryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { state } = useAppStore();
  const { secondHistory, bestDay } = state;

  const sortedHistory = Object.entries(secondHistory)
    .sort((a, b) => b[0].localeCompare(a[0]));

  const formatSeconds = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
        >
          <div className="p-6 border-b border-black/5 dark:border-white/10 flex justify-between items-center">
            <h3 className="text-xl font-bold dark:text-white">Activity History</h3>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
            {sortedHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p>No study sessions recorded yet.</p>
              </div>
            ) : (
              sortedHistory.map(([date, seconds]) => (
                <div 
                  key={date}
                  className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${
                    bestDay?.date === date 
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50' 
                      : 'bg-black/5 dark:bg-white/5 border-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {formatDate(date)}
                    </span>
                    {bestDay?.date === date && (
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Best Day Ever ⭐</span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    {formatSeconds(seconds as number)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-black/5 dark:bg-white/5 text-center">
            <p className="text-xs text-slate-500 font-medium italic">
              Keep pushing! Every minute counts towards your goal.
            </p>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
