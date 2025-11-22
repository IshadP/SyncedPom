import React, { useState, useEffect } from 'react';
import { MoreVertical, CheckCircle, Trash2, Plus } from 'lucide-react';

const TaskList = ({ activeColor, stats }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pomo_tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('pomo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const add = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([{ id: Date.now(), title: newTask, completed: false }, ...tasks]);
    setNewTask('');
    setIsAdding(false);
  };

  const toggle = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const remove = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="w-full max-w-md mt-8">
      <div className="flex justify-between items-center mb-4 text-white/90">
        <h2 className="text-xl font-bold">Tasks</h2>
        <div className="bg-white/20 p-2 rounded cursor-pointer hover:bg-white/30">
          <MoreVertical className="w-5 h-5" />
        </div>
      </div>

      {tasks.length > 0 && !tasks[0].completed && (
        <div className="bg-white/10 border-2 border-white/20 rounded-xl p-4 mb-6 text-center animate-in fade-in slide-in-from-bottom-2">
          <span className="text-xs font-bold tracking-widest opacity-60 uppercase">Current Focus</span>
          <div className="text-lg font-medium mt-1">{tasks[0].title}</div>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map(t => (
          <div key={t.id} className="group bg-white p-4 rounded-lg flex justify-between items-center shadow-sm border-l-4 border-transparent hover:border-gray-300 transition-all">
            <div className="flex items-center gap-3">
              <button onClick={() => toggle(t.id)} className={`${t.completed ? 'text-red-400' : 'text-gray-200 hover:text-gray-300'}`}>
                <CheckCircle className="w-6 h-6 fill-current" />
              </button>
              <span className={`font-medium text-gray-700 ${t.completed ? 'line-through text-gray-400' : ''}`}>{t.title}</span>
            </div>
            <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* Session Stats Footer */}
      <div className="mt-8 pt-6 border-t border-white/10 flex justify-center items-center gap-8 text-white/70">
        <div className="text-center">
          <div className="text-2xl font-bold leading-none">{stats?.solo || 0}</div>
          <div className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Solo</div>
        </div>
        <div className="w-px h-8 bg-white/10"></div>
        <div className="text-center">
          <div className="text-2xl font-bold leading-none">{stats?.group || 0}</div>
          <div className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Group</div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;