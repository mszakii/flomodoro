import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, useAppStore } from '../../lib/store';
import { cn } from '../../lib/utils';
import { playSound } from '../../lib/audio';

const TaskItem: React.FC<{
  task: Task;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent) => void;
}> = ({ task, onDragStart, onDragOver, onDrop }) => {
  const { state, setActiveTask, moveTask, deleteTask, updateTask } = useAppStore();
  const isActive = state.activeTaskId === task.id;
  const isWorkMode = state.timerMode === 'work' && state.timerStatus === 'running';

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.isCompleted) {
      if (state.settings.soundEnabled) playSound('ding');
      updateTask(task.id, { isCompleted: true });
    } else {
      updateTask(task.id, { isCompleted: false });
    }
  };

  const handleItemClick = () => {
    if (task.list === 'today') {
      if (isWorkMode && isActive) {
        // Can't easily deselect while working, handled by store
      } else {
        setActiveTask(isActive ? null : task.id);
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: task.isCompleted ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleItemClick}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={(e) => onDragOver(e, task.id)}
      onDrop={onDrop}
      className={cn(
        "group relative flex items-center p-3 mb-2 rounded-xl cursor-grab active:cursor-grabbing backdrop-blur-sm border transition-colors",
        isActive 
          ? "bg-sky-500/10 border-sky-500/30 dark:bg-sky-500/20 dark:border-sky-400/30" 
          : "bg-white/40 border-white/50 hover:bg-white/60 dark:bg-black/20 dark:border-white/10 dark:hover:bg-black/40"
      )}
    >
      <div 
        onClick={handleCheckboxClick}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 cursor-pointer transition-colors",
          task.isCompleted 
            ? "bg-slate-800 border-slate-800 dark:bg-white dark:border-white text-white dark:text-black" 
            : isActive ? "border-sky-500 dark:border-sky-400" : "border-slate-300 dark:border-slate-600 hover:border-slate-500"
        )}
      >
        {task.isCompleted && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-sm font-medium truncate transition-colors",
          task.isCompleted ? "line-through text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"
        )}>
          {task.title}
        </h4>
        <div className="flex items-center space-x-1 mt-1">
          {Array.from({ length: Math.max(task.estimatedPomos, task.completedPomos) }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                i < task.completedPomos 
                  ? "bg-rose-500 dark:bg-rose-400" 
                  : "bg-slate-200 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        {task.list === 'inbox' ? (
          <button 
            onClick={(e) => { e.stopPropagation(); moveTask(task.id, 'today'); }}
            className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-md dark:text-sky-400 dark:hover:bg-sky-900/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); moveTask(task.id, 'inbox'); }}
            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md dark:hover:bg-white/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
          className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-md dark:text-rose-400 dark:hover:bg-rose-900/30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {/* Active Pulse Effect */}
      {isActive && isWorkMode && (
        <motion.div 
          className="absolute inset-0 rounded-xl border-2 border-sky-400/50 dark:border-sky-500/50 pointer-events-none"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

export const TaskList: React.FC = () => {
  const { state, addTask, moveTask, reorderTasks } = useAppStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverList, setDragOverList] = useState<'inbox' | 'today' | null>(null);

  const inboxTasks = state.tasks.filter(t => t.list === 'inbox').sort((a,b) => a.order - b.order);
  const todayTasks = state.tasks.filter(t => t.list === 'today').sort((a,b) => a.order - b.order);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), 1, 'inbox');
      setNewTaskTitle('');
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent visual ghost glitching
    setTimeout(() => {
      const el = e.target as HTMLElement;
      el.style.opacity = '0.4';
    }, 0);
  };

  const handleDragOverItem = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragOverList = (e: React.DragEvent, list: 'inbox' | 'today') => {
    e.preventDefault();
    setDragOverList(list);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId) return;

    // reset opacity
    const el = document.querySelectorAll(`[draggable]`);
    el.forEach((n) => (n as HTMLElement).style.opacity = '');

    const task = state.tasks.find(t => t.id === draggedId);
    if (!task) return;

    if (dragOverList && dragOverList !== task.list) {
      // Moved to different list
      moveTask(draggedId, dragOverList);
    } else if (dragOverId && dragOverId !== draggedId) {
      // Reorder within the same list
      const listParams = task.list;
      const listTasks = state.tasks.filter(t => t.list === listParams).sort((a,b) => a.order - b.order);
      const startIndex = listTasks.findIndex(t => t.id === draggedId);
      const endIndex = listTasks.findIndex(t => t.id === dragOverId);
      if (startIndex !== -1 && endIndex !== -1) {
        reorderTasks(listParams, startIndex, endIndex);
      }
    }

    setDraggedId(null);
    setDragOverId(null);
    setDragOverList(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDragOverList(null);
    const el = document.querySelectorAll(`[draggable]`);
    el.forEach((n) => (n as HTMLElement).style.opacity = '');
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Today's Focus Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col p-4 rounded-3xl border transition-colors",
          dragOverList === 'today' ? "bg-black/10 border-black/20 dark:bg-white/10 dark:border-white/20" : "bg-black/5 border-transparent dark:bg-white/5"
        )}
        onDragOver={(e) => handleDragOverList(e, 'today')}
        onDrop={handleDrop}
      >
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-2 flex justify-between items-center">
          <span>Today's Focus</span>
          {todayTasks.length > 0 && (
            <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">
              {todayTasks.filter(t => t.isCompleted).length}/{todayTasks.length}
            </span>
          )}
        </h3>
        
        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar min-h-[100px]">
          <AnimatePresence>
            {todayTasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-full flex items-center justify-center text-center p-6 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl text-slate-400 dark:text-slate-500"
              >
                Drag a task here<br/>to start your day.
              </motion.div>
            ) : (
              todayTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOverItem}
                  onDrop={handleDrop}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Inbox Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col p-4 rounded-3xl border transition-colors",
          dragOverList === 'inbox' ? "bg-black/10 border-black/20 dark:bg-white/10 dark:border-white/20" : "bg-transparent border-black/10 dark:border-white/10"
        )}
        onDragOver={(e) => handleDragOverList(e, 'inbox')}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      >
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-2">Inbox</h3>
        
        <form onSubmit={handleAdd} className="mb-4 relative">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="w-full px-4 py-3 bg-white/50 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-rose-400 dark:focus:ring-rose-500 transition-shadow placeholder-slate-400 pr-12"
          />
          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-rose-500 text-white rounded-lg disabled:opacity-0 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </form>

        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
          <AnimatePresence>
            {inboxTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task}
                onDragStart={handleDragStart}
                onDragOver={handleDragOverItem}
                onDrop={handleDrop}
              />
            ))}
            {inboxTasks.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-6 text-slate-400 text-sm"
              >
                All empty. Add a task above!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};
