import { useState, useEffect } from 'react';
import { Flame, Plus, Trash2, Check, Award, Calendar, Sparkles, RotateCcw, X, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface StreakItem {
  id: string;
  title: string;
  color: string; // hex or tailwind class
  createdAt: number;
  completedDates: string[]; // YYYY-MM-DD
}

const DEFAULT_STREAKS: StreakItem[] = [
  {
    id: '1',
    title: 'Daily YouTube Learning',
    color: '#ef4444',
    createdAt: Date.now() - 86400000 * 5,
    completedDates: []
  },
  {
    id: '2',
    title: 'Study & Practice',
    color: '#3b82f6',
    createdAt: Date.now() - 86400000 * 10,
    completedDates: []
  }
];

const PRESET_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

// Helper to get local YYYY-MM-DD string
function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate streak count
function calculateStreak(completedDates: string[]): { currentStreak: number; maxStreak: number; isApprovedToday: boolean } {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, maxStreak: 0, isApprovedToday: false };
  }

  const todayStr = getTodayString();
  const isApprovedToday = completedDates.includes(todayStr);

  const sorted = [...new Set(completedDates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Check current streak starting from today or yesterday
  const today = new Date(todayStr);
  let checkDate = new Date(today);

  if (!isApprovedToday) {
    // Check if yesterday was completed to hold streak
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (sorted.includes(checkStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate max streak history
  const timeSorted = [...new Set(completedDates)].map(d => new Date(d).getTime()).sort((a, b) => a - b);
  if (timeSorted.length > 0) {
    tempStreak = 1;
    maxStreak = 1;
    for (let i = 1; i < timeSorted.length; i++) {
      const diffDays = Math.round((timeSorted[i] - timeSorted[i - 1]) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
  }

  return { currentStreak, maxStreak: Math.max(maxStreak, currentStreak), isApprovedToday };
}

export function DayStreakView() {
  const [streaks, setStreaks] = useState<StreakItem[]>([]);
  const [activeStreakId, setActiveStreakId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [justApproved, setJustApproved] = useState(false);

  // Load streaks
  useEffect(() => {
    const saved = localStorage.getItem('goodtube_day_streaks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setStreaks(parsed);
          setActiveStreakId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error('Failed to parse streaks');
      }
    }
    setStreaks(DEFAULT_STREAKS);
    setActiveStreakId(DEFAULT_STREAKS[0].id);
  }, []);

  // Save streaks
  useEffect(() => {
    if (streaks.length > 0) {
      localStorage.setItem('goodtube_day_streaks', JSON.stringify(streaks));
    }
  }, [streaks]);

  const activeStreak = streaks.find(s => s.id === activeStreakId) || streaks[0];

  const handleToggleToday = () => {
    if (!activeStreak) return;
    const todayStr = getTodayString();
    const isApproved = activeStreak.completedDates.includes(todayStr);

    let updatedDates: string[];
    if (isApproved) {
      updatedDates = activeStreak.completedDates.filter(d => d !== todayStr);
      setJustApproved(false);
    } else {
      updatedDates = [...activeStreak.completedDates, todayStr];
      setJustApproved(true);
      setTimeout(() => setJustApproved(false), 2000);
    }

    setStreaks(streaks.map(s => 
      s.id === activeStreak.id ? { ...s, completedDates: updatedDates } : s
    ));
  };

  const handleCreateStreak = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newStreak: StreakItem = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      color: selectedColor,
      createdAt: Date.now(),
      completedDates: []
    };

    setStreaks([...streaks, newStreak]);
    setActiveStreakId(newStreak.id);
    setNewTitle('');
    setIsCreating(false);
  };

  const handleDeleteStreak = (id: string) => {
    if (streaks.length <= 1) return;
    const updated = streaks.filter(s => s.id !== id);
    setStreaks(updated);
    if (activeStreakId === id) {
      setActiveStreakId(updated[0].id);
    }
  };

  const { currentStreak, maxStreak, isApprovedToday } = activeStreak 
    ? calculateStreak(activeStreak.completedDates) 
    : { currentStreak: 0, maxStreak: 0, isApprovedToday: false };

  // Generate last 7 days row
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isDone = activeStreak?.completedDates.includes(dateStr);
    const isToday = dateStr === getTodayString();
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    return { dateStr, isDone, isToday, dayLabel };
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
      
      {/* Header & Streak Tabs */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Day Streaks</h2>
              <p className="text-gray-400 text-sm">Build daily habits & track your momentum</p>
            </div>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-gray-500 px-4 py-2.5 rounded-xl font-medium text-sm text-gray-200 transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-orange-400" />
            <span>New Streak</span>
          </button>
        </div>

        {/* Streaks Tabs Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {streaks.map(streak => {
            const stats = calculateStreak(streak.completedDates);
            const isActive = streak.id === activeStreakId;
            return (
              <button
                key={streak.id}
                onClick={() => setActiveStreakId(streak.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all border ${
                  isActive 
                    ? 'bg-[#1e1e1e] border-orange-500/60 text-white shadow-lg' 
                    : 'bg-[#141414] border-[#222] text-gray-400 hover:text-gray-200 hover:border-[#333]'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: streak.color }} 
                />
                <span>{streak.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  stats.currentStreak > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-[#222] text-gray-500'
                }`}>
                  🔥 {stats.currentStreak}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Streak Modal / Inline Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 mb-8 shadow-2xl relative"
          >
            <button
              onClick={() => setIsCreating(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              Create a New Day Streak
            </h3>
            <form onSubmit={handleCreateStreak} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Streak Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Daily Piano Practice, Coding 1hr, Read 30m"
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-medium">Color Tag</label>
                <div className="flex gap-3">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-orange-900/30"
                >
                  Create Streak
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Big Circle Button Section */}
      {activeStreak && (
        <div className="flex-1 flex flex-col items-center justify-start py-4 w-full max-w-2xl mx-auto">
          
          {/* Streak Stats Badge Cards */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto mb-8 relative z-10">
            <div className="bg-[#141414] border border-[#222] rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
              <div className="text-xs text-gray-400 font-medium mb-1.5 flex items-center justify-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Current Streak</span>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-white flex items-baseline justify-center gap-1">
                <span>{currentStreak}</span>
                <span className="text-xs font-normal text-gray-400">days</span>
              </div>
            </div>

            <div className="bg-[#141414] border border-[#222] rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
              <div className="text-xs text-gray-400 font-medium mb-1.5 flex items-center justify-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>Best Streak</span>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-white flex items-baseline justify-center gap-1">
                <span>{maxStreak}</span>
                <span className="text-xs font-normal text-gray-400">days</span>
              </div>
            </div>
          </div>

          {/* Celebration Indicator */}
          <div className="h-8 mb-2 flex items-center justify-center">
            <AnimatePresence>
              {justApproved && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-1.5 shadow-xl border border-emerald-300"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Streak Approved for Today! 🔥</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* THE BIG CIRCLE BUTTON */}
          <div className="relative flex flex-col items-center justify-center my-4 py-2 z-10">
            
            {/* Outer Glow Ring - positioned behind button */}
            <div 
              className={`w-52 h-52 md:w-60 md:h-60 absolute rounded-full blur-3xl transition-all duration-700 pointer-events-none -z-10 ${
                isApprovedToday 
                  ? 'bg-emerald-500/25 scale-110' 
                  : 'bg-orange-500/20 scale-105'
              }`} 
            />

            <motion.button
              onClick={handleToggleToday}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              animate={justApproved ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`relative w-52 h-52 md:w-60 md:h-60 rounded-full flex flex-col items-center justify-center p-6 text-center shadow-2xl transition-all duration-500 cursor-pointer border-4 select-none ${
                isApprovedToday
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-800 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)]'
                  : 'bg-gradient-to-br from-orange-600 via-red-600 to-amber-700 border-orange-400 shadow-[0_0_40px_rgba(249,115,22,0.35)] hover:shadow-[0_0_60px_rgba(249,115,22,0.5)]'
              }`}
            >
              {isApprovedToday ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Check className="w-16 h-16 md:w-20 md:h-20 text-white stroke-[3] mb-1" />
                  </motion.div>
                  <span className="text-lg md:text-xl font-black text-white uppercase tracking-wider">
                    APPROVED
                  </span>
                  <span className="text-xs text-emerald-200 mt-1 font-medium">
                    Tap to undo
                  </span>
                </>
              ) : (
                <>
                  <Flame className="w-14 h-14 md:w-16 md:h-16 text-amber-200 mb-2 animate-pulse" fill="currentColor" />
                  <span className="text-lg md:text-xl font-black text-white uppercase tracking-wider leading-tight">
                    APPROVE TODAY
                  </span>
                  <span className="text-xs text-orange-200/90 mt-1 font-medium">
                    Click to count today!
                  </span>
                </>
              )}
            </motion.button>
          </div>

          {/* 7-Day History Track */}
          <div className="mt-8 bg-[#141414] border border-[#222] rounded-2xl p-5 w-full max-w-md shadow-lg relative z-10">
            <div className="flex items-center justify-between mb-3 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                Last 7 Days
              </span>
              <span>{isApprovedToday ? 'Today Approved ✓' : 'Today Pending...'}</span>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {last7Days.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className={`text-[10px] font-bold ${day.isToday ? 'text-orange-400' : 'text-gray-500'}`}>
                    {day.dayLabel}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                      day.isDone
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                        : day.isToday
                        ? 'bg-orange-500/10 border border-orange-500/40 text-orange-400 animate-pulse'
                        : 'bg-[#1e1e1e] border border-[#2a2a2a] text-gray-600'
                    }`}
                  >
                    {day.isDone ? <Check className="w-4 h-4 stroke-[3]" /> : day.dateStr.split('-')[2]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Streak option if multiple streaks */}
          {streaks.length > 1 && (
            <div className="mt-8">
              <button
                onClick={() => handleDeleteStreak(activeStreak.id)}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete "{activeStreak.title}" streak</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
