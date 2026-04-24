import React, { useState } from 'react';
import { AppProvider, useAppStore } from './lib/store';
import { TimerRing } from './components/timer/TimerRing';
import { TaskList } from './components/tasks/TaskList';
import { StatsSidebar } from './components/stats/StatsSidebar';
import { SettingsModal } from './components/settings/SettingsModal';

const Dashboard: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'stats'>('timer');
  const { state } = useAppStore();

  return (
    <div className="min-h-screen bg-[#f3f4F6] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Background Graphic elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-rose-400/20 dark:bg-rose-500/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-sky-400/20 dark:bg-sky-500/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-400/20 dark:bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 min-h-screen flex flex-col pb-24 lg:pb-8">
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left portion: Stats (3 columns) - Hidden on mobile unless active */}
          <div className={`lg:col-span-3 lg:flex flex-col lg:sticky lg:top-8 ${activeTab === 'stats' ? 'flex h-[calc(100vh-140px)]' : 'hidden'} lg:h-[calc(100vh-64px)]`}>
            <StatsSidebar onOpenSettings={() => setIsSettingsOpen(true)} />
          </div>

          {/* Main Timer Section (5 columns) */}
          <div className={`lg:col-span-5 lg:flex flex-col ${activeTab === 'timer' ? 'flex' : 'hidden'} min-h-[400px] lg:h-auto`}>
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-white/10 shadow-sm relative aspect-square lg:aspect-auto">
              <TimerRing />
              
              {state.activeTaskId && (
                <div className="absolute bottom-8 text-center px-4 max-w-full">
                  <p className="text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-[0.2em] mb-1">Focusing On</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {state.tasks.find(t => t.id === state.activeTaskId)?.title || "Unknown Task"}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right portion: Tasks (4 columns) */}
          <div className={`lg:col-span-4 lg:flex flex-col ${activeTab === 'tasks' ? 'flex h-[calc(100vh-140px)]' : 'hidden'} lg:h-[calc(100vh-64px)] bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-white/50 dark:border-white/10 p-2 relative overflow-hidden`}>
             <TaskList />
          </div>

        </div>
        
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl shadow-2xl p-2 flex items-center justify-around">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Stats</span>
          </button>

          <button 
            onClick={() => setActiveTab('timer')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${activeTab === 'timer' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Timer</span>
          </button>

          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Tasks</span>
          </button>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
