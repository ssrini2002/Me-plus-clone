// ============================================
// Me+ Clone — Data Store (localStorage)
// ============================================

const KEYS = {
  USER: 'meplus_user',
  ROUTINES: 'meplus_routines',
  HABITS: 'meplus_habits',
  MOODS: 'meplus_moods',
  COMPLETIONS: 'meplus_completions',
  HABIT_COMPLETIONS: 'meplus_habit_completions',
};

function get(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- User Profile ----------
export function getUser() {
  return get(KEYS.USER);
}

export function setUser(user) {
  set(KEYS.USER, user);
}

export function isOnboardingComplete() {
  const user = getUser();
  return user && user.onboardingComplete === true;
}

// ---------- Routines ----------
export function getRoutines() {
  return get(KEYS.ROUTINES) || [];
}

export function setRoutines(routines) {
  set(KEYS.ROUTINES, routines);
}

export function addRoutine(routine) {
  const routines = getRoutines();
  routines.push(routine);
  setRoutines(routines);
  return routine;
}

export function updateRoutine(id, updates) {
  const routines = getRoutines();
  const idx = routines.findIndex(r => r.id === id);
  if (idx !== -1) {
    routines[idx] = { ...routines[idx], ...updates };
    setRoutines(routines);
  }
  return routines[idx];
}

export function deleteRoutine(id) {
  const routines = getRoutines().filter(r => r.id !== id);
  setRoutines(routines);
}

// ---------- Daily Task Completions ----------
export function getCompletions(date) {
  const all = get(KEYS.COMPLETIONS) || {};
  return all[date] || {};
}

export function setTaskCompletion(date, taskId, completed) {
  const all = get(KEYS.COMPLETIONS) || {};
  if (!all[date]) all[date] = {};
  all[date][taskId] = completed;
  set(KEYS.COMPLETIONS, all);
}

export function getAllCompletions() {
  return get(KEYS.COMPLETIONS) || {};
}

// ---------- Habits ----------
export function getHabits() {
  return get(KEYS.HABITS) || [];
}

export function setHabits(habits) {
  set(KEYS.HABITS, habits);
}

export function addHabit(habit) {
  const habits = getHabits();
  habits.push(habit);
  setHabits(habits);
  return habit;
}

export function updateHabit(id, updates) {
  const habits = getHabits();
  const idx = habits.findIndex(h => h.id === id);
  if (idx !== -1) {
    habits[idx] = { ...habits[idx], ...updates };
    setHabits(habits);
  }
  return habits[idx];
}

export function deleteHabit(id) {
  const habits = getHabits().filter(h => h.id !== id);
  setHabits(habits);
}

export function toggleHabitCompletion(habitId, date) {
  const habits = getHabits();
  const idx = habits.findIndex(h => h.id === habitId);
  if (idx !== -1) {
    if (!habits[idx].completions) habits[idx].completions = {};
    habits[idx].completions[date] = !habits[idx].completions[date];
    if (!habits[idx].completions[date]) delete habits[idx].completions[date];
    setHabits(habits);
    return habits[idx].completions[date] || false;
  }
  return false;
}

export function getHabitStreak(habit) {
  if (!habit.completions) return 0;
  let streak = 0;
  const today = new Date();
  const d = new Date(today);
  
  while (true) {
    const key = d.toISOString().split('T')[0];
    if (habit.completions[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getHabitBestStreak(habit) {
  if (!habit.completions) return 0;
  const dates = Object.keys(habit.completions).filter(k => habit.completions[k]).sort();
  if (dates.length === 0) return 0;
  
  let best = 1;
  let current = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

export function getHabitCompletionRate(habit) {
  if (!habit.completions || !habit.createdAt) return 0;
  const start = new Date(habit.createdAt);
  const today = new Date();
  const totalDays = Math.max(1, Math.ceil((today - start) / (1000 * 60 * 60 * 24)));
  const completedDays = Object.values(habit.completions).filter(Boolean).length;
  return Math.round((completedDays / totalDays) * 100);
}

// ---------- Mood Entries ----------
export function getMoods() {
  return get(KEYS.MOODS) || [];
}

export function setMoods(moods) {
  set(KEYS.MOODS, moods);
}

export function addMood(entry) {
  const moods = getMoods();
  // Replace if same date exists
  const existing = moods.findIndex(m => m.date === entry.date);
  if (existing !== -1) {
    moods[existing] = { ...moods[existing], ...entry };
  } else {
    moods.push(entry);
  }
  setMoods(moods);
  return entry;
}

export function getMoodByDate(date) {
  const moods = getMoods();
  return moods.find(m => m.date === date) || null;
}

export function getMoodsByRange(startDate, endDate) {
  const moods = getMoods();
  return moods.filter(m => m.date >= startDate && m.date <= endDate);
}

export function getAverageMood(days = 30) {
  const moods = getMoods();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const recent = moods.filter(m => m.date >= cutoffStr && m.mood);
  if (recent.length === 0) return 0;
  const sum = recent.reduce((acc, m) => acc + m.mood, 0);
  return Math.round((sum / recent.length) * 10) / 10;
}

// ---------- Stats ----------
export function getStats() {
  const habits = getHabits();
  const moods = getMoods();
  const completions = getAllCompletions();
  
  let totalTasksCompleted = 0;
  Object.values(completions).forEach(dayComps => {
    totalTasksCompleted += Object.values(dayComps).filter(Boolean).length;
  });
  
  let longestStreak = 0;
  habits.forEach(h => {
    longestStreak = Math.max(longestStreak, getHabitStreak(h));
  });
  
  const daysJournaled = moods.filter(m => m.journal && m.journal.trim()).length;
  
  return {
    totalHabits: habits.length,
    longestStreak,
    totalTasksCompleted,
    daysJournaled,
    averageMood: getAverageMood(30),
  };
}

// ---------- Export / Import ----------
export function exportAllData() {
  const data = {};
  Object.entries(KEYS).forEach(([, key]) => {
    data[key] = get(key);
  });
  return data;
}

export function importAllData(data) {
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null) {
      set(key, value);
    }
  });
}

export function clearAllData() {
  Object.values(KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
