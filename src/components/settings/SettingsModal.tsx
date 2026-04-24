import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../lib/store';
import { cn } from '../../lib/utils';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { state, updateSettings, resetData, resetToday, importData } = useAppStore();
  const { settings } = state;
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);
  const [confirmValue, setConfirmValue] = useState('');

  if (!isOpen) return null;

  const handleResetAll = () => {
    if (confirmValue === 'flomo rm data') {
      resetData();
      setShowDangerConfirm(false);
      setConfirmValue('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border border-white/50 dark:border-white/10 overflow-hidden"
        >
          <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-semibold dark:text-white">Settings</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
            
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Durations (Minutes)</h3>
              <div className="space-y-3">
                {[
                  { key: 'workDuration', label: 'Focus' },
                  { key: 'shortBreakDuration', label: 'Short Break' },
                  { key: 'longBreakDuration', label: 'Long Break' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <label className="text-sm font-medium dark:text-slate-300">{item.label}</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="60"
                      value={Math.round(settings[item.key as keyof typeof settings] as number / 60)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          updateSettings({ [item.key]: val * 60 });
                        }
                      }}
                      className="w-16 px-2 py-1 text-right bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-sky-400 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium dark:text-slate-300">Sound Effects</span>
                  <div className={cn(
                    "w-11 h-6 rounded-full transition-colors relative",
                    settings.soundEnabled ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                  )}>
                    <div className={cn(
                      "absolute top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm",
                      settings.soundEnabled ? "left-6" : "left-1"
                    )} />
                  </div>
                  <input type="checkbox" className="hidden" checked={settings.soundEnabled} onChange={(e) => updateSettings({ soundEnabled: e.target.checked })} />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium dark:text-slate-300">Dark Mode</span>
                  <div className={cn(
                    "w-11 h-6 rounded-full transition-colors relative",
                    settings.darkMode ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"
                  )}>
                    <div className={cn(
                      "absolute top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm",
                      settings.darkMode ? "left-6" : "left-1"
                    )} />
                  </div>
                  <input type="checkbox" className="hidden" checked={settings.darkMode} onChange={(e) => updateSettings({ darkMode: e.target.checked })} />
                </label>
              </div>
            </section>

            <section className="pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
              <h3 className="text-sm font-semibold text-rose-500 uppercase tracking-widest px-1">Danger Zone</h3>
              
              {!showDangerConfirm ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (confirm("Reset today's focus data and move today's tasks back to inbox?")) {
                        resetToday();
                        onClose();
                      }
                    }}
                    className="flex-1 py-2.5 px-4 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold rounded-xl hover:bg-orange-500/20 active:scale-[0.98] transition-all text-sm"
                  >
                    Reset Today
                  </button>
                  <button 
                    onClick={() => setShowDangerConfirm(true)}
                    className="flex-1 py-2.5 px-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold rounded-xl hover:bg-rose-500/20 active:scale-[0.98] transition-all text-sm"
                  >
                    Reset All
                  </button>
                </div>
              ) : (
                <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20 space-y-3">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Type <span className="underline select-all">flomo rm data</span> to confirm:
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={confirmValue}
                    onChange={(e) => setConfirmValue(e.target.value)}
                    placeholder="Type confirmation here..."
                    className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-rose-300 dark:border-rose-900 rounded-xl outline-none focus:ring-2 ring-rose-500 text-sm font-bold"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setShowDangerConfirm(false);
                        setConfirmValue('');
                      }}
                      className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-black/5 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={confirmValue !== 'flomo rm data'}
                      onClick={handleResetAll}
                      className="flex-[2] py-2 bg-rose-500 text-white text-xs font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rose-600 transition-colors"
                    >
                      Confirm Destruction
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
                    const downloadAnchorNode = document.createElement('a');
                    downloadAnchorNode.setAttribute("href",     dataStr);
                    downloadAnchorNode.setAttribute("download", "flowmodoro_backup.json");
                    document.body.appendChild(downloadAnchorNode);
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                  }}
                  className="flex-1 py-2 px-4 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-black/10 dark:hover:bg-white/20 active:scale-[0.98] transition-all text-xs"
                >
                  Export Backup
                </button>
                <label className="flex-1 py-2 px-4 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-black/10 dark:hover:bg-white/20 active:scale-[0.98] transition-all text-xs cursor-pointer text-center">
                  Import Backup
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result && typeof event.target.result === 'string') {
                           importData(event.target.result);
                           alert("Data imported successfully!");
                           onClose();
                        }
                      };
                      reader.readAsText(file);
                    }} 
                  />
                </label>
              </div>
            </section>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
