import React, { useState, useEffect } from 'react';
import { CheckCircle, Trash2, Plus, Clock } from 'lucide-react';
import QuickAddModal from './QuickAddModal';

const TaskList = ({ activeColor }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pomo_tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('pomo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for 'q' or 'Q'
      if (e.key.toLowerCase() === 'q') {
        // Don't trigger if user is typing in an input or textarea
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          return;
        }
        e.preventDefault();
        setShowQuickAdd(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Standard Add
  const add = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([{ id: Date.now(), title: newTask, completed: false, sessions: 0 }, ...tasks]);
    setNewTask('');
    setIsAdding(false);
  };

  // Quick Add Handler
  const handleQuickAdd = ({ title, sessions }) => {
    setTasks(prev => [{ 
      id: Date.now(), 
      title, 
      completed: false, 
      sessions: sessions || 0 
    }, ...prev]);
  };

  const toggle = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const remove = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <>
      <div className="w-full max-w-md mt-8">
        <div className="flex justify-between items-center mb-4 text-white/90">
          <h2 className="text-xl font-bold">Tasks</h2>
          <div className="flex items-center gap-2">
             <span className="text-xs opacity-50 bg-white/10 px-2 py-1 rounded hidden sm:inline-block">Press 'Q' to add</span>
          </div>
        </div>

        {tasks.length > 0 && !tasks[0].completed && (
          <div className="bg-white/10 border-2 border-white/20 rounded-xl p-4 mb-6 text-center animate-in fade-in slide-in-from-bottom-2">
            <span className="text-xs font-bold tracking-widest opacity-60 uppercase">Current Focus</span>
            <div className="text-lg font-medium mt-1">{tasks[0].title}</div>
            {tasks[0].sessions > 0 && (
              <div className="flex items-center justify-center gap-1 mt-2 text-sm opacity-75">
                <Clock className="w-3 h-3" />
                <span>{tasks[0].sessions} sessions estimated</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="group bg-white p-4 rounded-lg flex justify-between items-center shadow-sm border-l-4 border-transparent hover:border-gray-300 transition-all">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button onClick={() => toggle(t.id)} className={`${t.completed ? 'text-red-400' : 'text-gray-200 hover:text-gray-300'} flex-shrink-0`}>
                  <CheckCircle className="w-6 h-6 fill-current" />
                </button>
                <div className="flex flex-col truncate">
                  <span className={`font-medium text-gray-700 truncate ${t.completed ? 'line-through text-gray-400' : ''}`}>{t.title}</span>
                  {t.sessions > 0 && !t.completed && (
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {t.sessions}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {isAdding ? (
          <form onSubmit={add} className="mt-4 bg-white rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
            <input 
              autoFocus
              className="w-full text-lg font-medium text-gray-800 placeholder:text-gray-400 outline-none mb-4"
              placeholder="What are you working on?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900">Save</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsAdding(true)} className="w-full mt-4 py-4 border-2 border-dashed border-white/30 bg-black/10 rounded-xl flex items-center justify-center gap-2 font-bold text-lg hover:bg-black/20 hover:border-white/40 transition-all">
            <Plus className="w-5 h-5" /> Add Task
          </button>
        )}
      </div>

      <QuickAddModal 
        isOpen={showQuickAdd} 
        onClose={() => setShowQuickAdd(false)} 
        onAdd={handleQuickAdd} 
      />
    </>
  );
};

export default TaskList;