import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';

export type TaskListType = 'inbox' | 'today';
export type TimerMode = 'work' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface Task {
  id: string;
  title: string;
  estimatedPomos: number;
  completedPomos: number;
  list: TaskListType;
  order: number;
  isCompleted: boolean;
}

export interface AppSettings {
  workDuration: number; // in seconds
  shortBreakDuration: number;
  longBreakDuration: number;
  soundEnabled: boolean;
  darkMode: boolean;
  accentColor: string;
}

export interface AppState {
  tasks: Task[];
  activeTaskId: string | null;
  timerMode: TimerMode;
  timerStatus: TimerStatus;
  timeLeft: number;
  sessionCount: number;
  points: number;
  dailyStreak: number;
  focusStreak: number;
  bestDailyStreak: number;
  weeklyHistory: Record<string, number>;
  secondHistory: Record<string, number>; // Date -> Total focus seconds
  bestDay: { date: string; seconds: number } | null;
  lastActiveDate: string;
  userName: string;
  settings: AppSettings;
  lastTickTime?: number;
  hasPausedCurrentSession: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  soundEnabled: true,
  darkMode: true,
  accentColor: 'rose', 
};

const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const INITIAL_STATE: AppState = {
  tasks: [],
  activeTaskId: null,
  timerMode: 'work',
  timerStatus: 'idle',
  timeLeft: DEFAULT_SETTINGS.workDuration,
  sessionCount: 0,
  points: 0,
  dailyStreak: 0,
  focusStreak: 0,
  bestDailyStreak: 0,
  weeklyHistory: {},
  secondHistory: {},
  bestDay: null,
  lastActiveDate: getTodayDateString(),
  userName: 'Productive Hub',
  settings: DEFAULT_SETTINGS,
  hasPausedCurrentSession: false,
};

type AppContextType = {
  state: AppState;
  setUserName: (name: string) => void;
  // Tasks
  addTask: (title: string, estimate: number, list?: TaskListType) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, targetList: TaskListType) => void;
  reorderTasks: (listName: TaskListType, startIndex: number, endIndex: number) => void;
  setActiveTask: (id: string | null) => void;
  
  // Timer
  startTimer: () => void;
  pauseTimer: () => void;
  skipSession: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  handleSessionComplete: () => void;
  
  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetData: () => void;
  resetToday: () => void;
  importData: (jsonData: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pomoflow_data_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        // Handle daily reset
        const todayStr = getTodayDateString();
        if (parsed.lastActiveDate !== todayStr) {
          // Check streak preservation (if last active was > 1 day ago)
          const lastActiveParts = parsed.lastActiveDate.split('-');
          const todayParts = todayStr.split('-');
          const lastActive = new Date(Number(lastActiveParts[0]), Number(lastActiveParts[1]) - 1, Number(lastActiveParts[2]));
          const today = new Date(Number(todayParts[0]), Number(todayParts[1]) - 1, Number(todayParts[2]));
          const diffTime = Math.abs(today.getTime() - lastActive.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
            parsed.dailyStreak = 0; // Broken streak
          }
          
          parsed.lastActiveDate = todayStr;
          // Reset today list to inbox
          parsed.tasks = parsed.tasks.map((t: Task) => t.list === 'today' ? { ...t, list: 'inbox' } : t);
          parsed.activeTaskId = null;
          parsed.timerStatus = 'idle';
          parsed.timerMode = 'work';
          parsed.timeLeft = parsed.settings?.workDuration || DEFAULT_SETTINGS.workDuration;
        }

        if (parsed.timerStatus === 'running' && parsed.lastTickTime) {
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - parsed.lastTickTime) / 1000);
          parsed.timeLeft = Math.max(0, parsed.timeLeft - elapsedSeconds);
          parsed.lastTickTime = now;
          if (parsed.timeLeft === 0) {
            parsed.timerStatus = 'idle';
          }
        }
        
        return { ...INITIAL_STATE, ...parsed };
      }
    } catch (error) {
      console.warn("Could not load save data", error);
    }
    return INITIAL_STATE;
  });

  const lastTickTimeRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Could not save data", error);
    }
  }, [state]);

  // Apply dark mode at root level
  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  // Handle midnight reset while app is open
  useEffect(() => {
    const checkDate = () => {
      const todayStr = getTodayDateString();
      if (state.lastActiveDate !== todayStr) {
        setState(s => {
          const lastActiveParts = s.lastActiveDate.split('-');
          const todayParts = todayStr.split('-');
          const lastActive = new Date(Number(lastActiveParts[0]), Number(lastActiveParts[1]) - 1, Number(lastActiveParts[2]));
          const today = new Date(Number(todayParts[0]), Number(todayParts[1]) - 1, Number(todayParts[2]));
          const diffTime = Math.abs(today.getTime() - lastActive.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          return {
            ...s,
            dailyStreak: diffDays > 1 ? 0 : s.dailyStreak,
            lastActiveDate: todayStr,
            tasks: s.tasks.map(t => t.list === 'today' ? { ...t, list: 'inbox' } : t),
            activeTaskId: null,
            timerStatus: 'idle',
            timerMode: 'work',
            timeLeft: s.settings.workDuration
          };
        });
      }
    };

    const interval = setInterval(checkDate, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.lastActiveDate, state.settings.workDuration]);

  const addTask = (title: string, estimate: number, list: TaskListType = 'inbox') => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      estimatedPomos: estimate,
      completedPomos: 0,
      list,
      order: state.tasks.filter(t => t.list === list).length,
      isCompleted: false,
    };
    setState(s => ({ ...s, tasks: [...s.tasks, newTask] }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setState(s => {
      const newTasks = s.tasks.filter(t => t.id !== id);
      return { 
        ...s, 
        tasks: newTasks,
        activeTaskId: s.activeTaskId === id ? null : s.activeTaskId
      };
    });
  };

  const moveTask = (id: string, targetList: TaskListType) => {
    setState(s => {
      const task = s.tasks.find(t => t.id === id);
      if (!task || task.list === targetList) return s;
      
      const newTasks = s.tasks.map(t => {
        if (t.id === id) {
          return { ...t, list: targetList, order: s.tasks.filter(xt => xt.list === targetList).length };
        }
        return t;
      });
      return { ...s, tasks: newTasks };
    });
  };

  const reorderTasks = (listName: TaskListType, startIndex: number, endIndex: number) => {
    setState(s => {
      const listTasks = s.tasks.filter(t => t.list === listName).sort((a,b) => a.order - b.order);
      const [removed] = listTasks.splice(startIndex, 1);
      listTasks.splice(endIndex, 0, removed);
      
      // Update orders
      listTasks.forEach((t, index) => { t.order = index; });
      
      const otherTasks = s.tasks.filter(t => t.list !== listName);
      return { ...s, tasks: [...otherTasks, ...listTasks] };
    });
  };

  const setActiveTask = (id: string | null) => {
    setState(s => {
      // If we are currently running a work session, switching tasks breaks the focus streak
      let newFocusStreak = s.focusStreak;
      let newPaused = s.hasPausedCurrentSession;
      if (s.timerStatus === 'running' && s.timerMode === 'work' && s.activeTaskId && id !== s.activeTaskId) {
        newFocusStreak = 0;
        newPaused = true;
      }
      return { ...s, activeTaskId: id, focusStreak: newFocusStreak, hasPausedCurrentSession: newPaused };
    });
  };

  const startTimer = () => {
    setState(s => {
      if (s.timerStatus === 'running') return s;
      lastTickTimeRef.current = Date.now();
      return { ...s, timerStatus: 'running', lastTickTime: Date.now() };
    });
  };

  const pauseTimer = () => {
    setState(s => {
      if (s.timerStatus !== 'running') return s;
      // Pausing no longer breaks the focus streak to be more lenient
      return { ...s, timerStatus: 'paused', lastTickTime: undefined, hasPausedCurrentSession: true };
    });
  };

  const handleSessionComplete = () => {
    setState(s => {
      let newState = { ...s, lastTickTime: undefined };
      
      if (s.timerMode === 'work') {
        const todayStr = getTodayDateString();
        
        // Update task if active
        if (s.activeTaskId) {
          const task = s.tasks.find(t => t.id === s.activeTaskId);
          if (task) {
            const completed = task.completedPomos + 1;
            const isNowCompleted = !task.isCompleted && completed >= task.estimatedPomos;
            
            newState.tasks = s.tasks.map(t => {
              if (t.id === s.activeTaskId) {
                return { ...t, completedPomos: completed, isCompleted: isNowCompleted || t.isCompleted };
              }
              return t;
            });
            
            if (isNowCompleted) {
              newState.points += 50;
            }
          }
        }
        
        // Calculate points
        let ptsGained = 10;
        // if we didn't pause, get +5 bonus
        if (!s.hasPausedCurrentSession) {
          ptsGained += 5;
        }
        
        const newSessionCount = s.sessionCount + 1;
        const nextMode: TimerMode = newSessionCount % 4 === 0 ? 'longBreak' : 'shortBreak';
        
        newState = {
          ...newState,
          timerStatus: 'idle',
          timerMode: nextMode,
          timeLeft: newState.settings[`${nextMode}Duration`],
          sessionCount: newSessionCount,
          points: s.points + ptsGained,
          focusStreak: s.hasPausedCurrentSession ? 1 : s.focusStreak + 1,
          hasPausedCurrentSession: false,
          weeklyHistory: {
            ...s.weeklyHistory,
            [todayStr]: (s.weeklyHistory[todayStr] || 0) + 1
          }
        };
      } else {
        // Was a break, time to work again
        newState = {
          ...newState,
          timerStatus: 'idle',
          timerMode: 'work',
          timeLeft: newState.settings.workDuration,
          hasPausedCurrentSession: false,
        };
      }
      
      return newState;
    });
  };

  const skipSession = () => {
    setState(s => {
      // Skipping breaks focus streak
      const newState = { ...s, focusStreak: 0, lastTickTime: undefined, hasPausedCurrentSession: false };
      const nextMode: TimerMode = 
        s.timerMode === 'work' 
        ? ((s.sessionCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak')
        : 'work';
        
      return {
        ...newState,
        timerMode: nextMode,
        timerStatus: 'idle',
        timeLeft: newState.settings[`${nextMode}Duration`],
        sessionCount: s.timerMode === 'work' ? s.sessionCount + 1 : s.sessionCount
      };
    });
  };

  const resetTimer = () => {
    setState(s => ({
      ...s,
      timerStatus: 'idle',
      timeLeft: s.settings[`${s.timerMode}Duration`],
      focusStreak: 0,
      lastTickTime: undefined,
      hasPausedCurrentSession: false,
    }));
  };

  const tickTimer = () => {
    setState(s => {
      if (s.timerStatus !== 'running') return s;
      
      const now = Date.now();
      let decrement = 1;

      if (s.lastTickTime) {
        const elapsed = now - s.lastTickTime;
        if (elapsed > 1500) {
          decrement = Math.floor(elapsed / 1000);
        }
      }

      const newTimeLeft = Math.max(0, s.timeLeft - decrement);
      const todayStr = getTodayDateString();
      
      let newState = { ...s, timeLeft: newTimeLeft, lastTickTime: now };

      // Record focus time if in work mode
      if (s.timerMode === 'work') {
        const currentSeconds = s.secondHistory[todayStr] || 0;
        const newSeconds = currentSeconds + decrement;
        const newHistory = { ...s.secondHistory, [todayStr]: newSeconds };
        
        let newBestDay = s.bestDay;
        if (!newBestDay || newSeconds > newBestDay.seconds) {
          newBestDay = { date: todayStr, seconds: newSeconds };
        }

        newState = { ...newState, secondHistory: newHistory, bestDay: newBestDay };

        // Increment daily streak if it's the first bit of work today
        if (currentSeconds === 0) {
          newState.dailyStreak = s.dailyStreak + 1;
          if (newState.dailyStreak > s.bestDailyStreak) {
            newState.bestDailyStreak = newState.dailyStreak;
          }
        }
      }
      
      if (newTimeLeft <= 0) {
        return { ...newState, timeLeft: 0, lastTickTime: undefined }; 
      }
      
      return newState;
    });
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setState(s => {
      const newSettings = { ...s.settings, ...updates };
      // if timer is idle, update time left according to new settings
      let newTimeLeft = s.timeLeft;
      if (s.timerStatus === 'idle') {
        newTimeLeft = newSettings[`${s.timerMode}Duration`];
      }
      return { ...s, settings: newSettings, timeLeft: newTimeLeft };
    });
  };

  const resetData = () => {
    setState(s => ({ ...INITIAL_STATE, userName: s.userName, settings: s.settings }));
  };

  const resetToday = () => {
    const todayStr = getTodayDateString();
    setState(s => {
      const newSecondHistory = { ...s.secondHistory };
      delete newSecondHistory[todayStr];
      
      const newWeeklyHistory = { ...s.weeklyHistory };
      delete newWeeklyHistory[todayStr];

      // If best day was today, we need to find the new best day
      let newBestDay = s.bestDay;
      if (s.bestDay?.date === todayStr) {
        const historyEntries = Object.entries(newSecondHistory);
        if (historyEntries.length > 0) {
          const [date, seconds] = historyEntries.reduce((best, curr) => curr[1] > best[1] ? curr : best);
          newBestDay = { date, seconds };
        } else {
          newBestDay = null;
        }
      }

      return {
        ...s,
        secondHistory: newSecondHistory,
        weeklyHistory: newWeeklyHistory,
        bestDay: newBestDay,
        // Resetting today also removes today's tasks or moves them
        tasks: s.tasks.map(t => t.list === 'today' ? { ...t, list: 'inbox' as TaskListType } : t),
        timerStatus: 'idle',
        timerMode: 'work',
        timeLeft: s.settings.workDuration,
        lastTickTime: undefined,
      };
    });
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      setState({ ...INITIAL_STATE, ...parsed });
    } catch (e) {
      console.error("Invalid import data", e);
      alert("Invalid backup file format.");
    }
  };

  const setUserName = (name: string) => {
    setState(s => ({ ...s, userName: name }));
  };

  return (
    <AppContext.Provider value={{
      state, setUserName, addTask, updateTask, deleteTask, moveTask, reorderTasks, setActiveTask,
      startTimer, pauseTimer, skipSession, resetTimer, tickTimer, handleSessionComplete,
      updateSettings, resetData, resetToday, importData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
};
