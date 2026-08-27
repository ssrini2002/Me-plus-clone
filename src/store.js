// ============================================
// Me+ Clone — Data Store (IndexedDB via Dexie)
// ============================================
// All public read/write functions remain SYNCHRONOUS.
// An in-memory cache is loaded once at boot from IndexedDB.
// Every write updates the cache immediately, then persists
// asynchronously to IndexedDB (fire-and-forget with error logging).
// ============================================

import db from './db.js';

// ---------- In-memory cache ----------
const cache = {
  user: null,
  routines: [],
  habits: [],
  moods: [],
  completions: {},   // { [date]: { [taskId]: bool } }
};

// ---------- Async persistence helpers ----------
function persistUser() {
  db.user.put({ id: 1, ...cache.user }).catch(err =>
    console.error('[MePlus DB] Failed to persist user:', err)
  );
}

function persistRoutines() {
  db.transaction('rw', db.routines, async () => {
    await db.routines.clear();
    if (cache.routines.length > 0) {
      await db.routines.bulkPut(cache.routines);
    }
  }).catch(err =>
    console.error('[MePlus DB] Failed to persist routines:', err)
  );
}

function persistHabits() {
  db.transaction('rw', db.habits, async () => {
    await db.habits.clear();
    if (cache.habits.length > 0) {
      await db.habits.bulkPut(cache.habits);
    }
  }).catch(err =>
    console.error('[MePlus DB] Failed to persist habits:', err)
  );
}

function persistMoods() {
  db.transaction('rw', db.moods, async () => {
    await db.moods.clear();
    if (cache.moods.length > 0) {
      await db.moods.bulkPut(cache.moods);
    }
  }).catch(err =>
    console.error('[MePlus DB] Failed to persist moods:', err)
  );
}

function persistCompletion(date) {
  const entry = { date, tasks: cache.completions[date] || {} };
  db.completions.put(entry).catch(err =>
    console.error('[MePlus DB] Failed to persist completion:', err)
  );
}

// ---------- localStorage migration ----------
const LS_KEYS = {
  USER: 'meplus_user',
  ROUTINES: 'meplus_routines',
  HABITS: 'meplus_habits',
  MOODS: 'meplus_moods',
  COMPLETIONS: 'meplus_completions',
};
const LS_MIGRATED_FLAG = 'meplus_migrated_to_indexeddb';

function readLS(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function migrateFromLocalStorage() {
  // Already migrated — skip
  if (localStorage.getItem(LS_MIGRATED_FLAG)) return;

  const lsUser = readLS(LS_KEYS.USER);
  const lsRoutines = readLS(LS_KEYS.ROUTINES);
  const lsHabits = readLS(LS_KEYS.HABITS);
  const lsMoods = readLS(LS_KEYS.MOODS);
  const lsCompletions = readLS(LS_KEYS.COMPLETIONS);

  // Nothing to migrate
  const hasData = lsUser || (lsRoutines && lsRoutines.length) ||
    (lsHabits && lsHabits.length) || (lsMoods && lsMoods.length) ||
    (lsCompletions && Object.keys(lsCompletions).length);

  if (!hasData) {
    localStorage.setItem(LS_MIGRATED_FLAG, '1');
    return;
  }

  console.log('[MePlus DB] Migrating localStorage data to IndexedDB…');

  if (lsUser) {
    cache.user = lsUser;
    await db.user.put({ id: 1, ...lsUser });
  }
  if (lsRoutines && lsRoutines.length) {
    cache.routines = lsRoutines;
    await db.routines.bulkPut(lsRoutines);
  }
  if (lsHabits && lsHabits.length) {
    cache.habits = lsHabits;
    await db.habits.bulkPut(lsHabits);
  }
  if (lsMoods && lsMoods.length) {
    cache.moods = lsMoods;
    await db.moods.bulkPut(lsMoods);
  }
  if (lsCompletions && Object.keys(lsCompletions).length) {
    cache.completions = lsCompletions;
    const entries = Object.entries(lsCompletions).map(([date, tasks]) => ({ date, tasks }));
    await db.completions.bulkPut(entries);
  }

  localStorage.setItem(LS_MIGRATED_FLAG, '1');
  console.log('[MePlus DB] Migration complete.');
}

// ---------- Store initialization ----------
export async function initStore() {
  // Open DB
  await db.open();

  // Attempt localStorage → IndexedDB migration
  await migrateFromLocalStorage();

  // Load all data into cache
  const userRow = await db.user.get(1);
  if (userRow) {
    const { id: _id, ...userData } = userRow;
    cache.user = userData;
  }

  cache.routines = await db.routines.toArray();
  cache.habits = await db.habits.toArray();
  cache.moods = await db.moods.toArray();

  const completionRows = await db.completions.toArray();
  cache.completions = {};
  completionRows.forEach(row => {
    cache.completions[row.date] = row.tasks;
  });

  // Request persistent storage so the browser won't evict our data
  if (navigator.storage && navigator.storage.persist) {
    const granted = await navigator.storage.persist();
    console.log(`[MePlus DB] Persistent storage ${granted ? 'granted ✓' : 'denied ✗'}`);
  }

  console.log('[MePlus DB] Store initialized from IndexedDB.');
}

// ============================================
// PUBLIC API — Same synchronous signatures as before
// ============================================

// ---------- User Profile ----------
export function getUser() {
  return cache.user;
}

export function setUser(user) {
  cache.user = user;
  persistUser();
}

export function isOnboardingComplete() {
  const user = getUser();
  return user && user.onboardingComplete === true;
}

// ---------- Routines ----------
export function getRoutines() {
  return cache.routines;
}

export function setRoutines(routines) {
  cache.routines = routines;
  persistRoutines();
}

export function addRoutine(routine) {
  cache.routines.push(routine);
  persistRoutines();
  return routine;
}

export function updateRoutine(id, updates) {
  const idx = cache.routines.findIndex(r => r.id === id);
  if (idx !== -1) {
    cache.routines[idx] = { ...cache.routines[idx], ...updates };
    persistRoutines();
  }
  return cache.routines[idx];
}

export function deleteRoutine(id) {
  cache.routines = cache.routines.filter(r => r.id !== id);
  persistRoutines();
}

// ---------- Daily Task Completions ----------
export function getCompletions(date) {
  return cache.completions[date] || {};
}

export function setTaskCompletion(date, taskId, completed) {
  if (!cache.completions[date]) cache.completions[date] = {};
  cache.completions[date][taskId] = completed;
  persistCompletion(date);
}

export function getAllCompletions() {
  return cache.completions;
}

// ---------- Habits ----------
export function getHabits() {
  return cache.habits;
}

export function setHabits(habits) {
  cache.habits = habits;
  persistHabits();
}

export function addHabit(habit) {
  cache.habits.push(habit);
  persistHabits();
  return habit;
}

export function updateHabit(id, updates) {
  const idx = cache.habits.findIndex(h => h.id === id);
  if (idx !== -1) {
    cache.habits[idx] = { ...cache.habits[idx], ...updates };
    persistHabits();
  }
  return cache.habits[idx];
}

export function deleteHabit(id) {
  cache.habits = cache.habits.filter(h => h.id !== id);
  persistHabits();
}

export function toggleHabitCompletion(habitId, date) {
  const idx = cache.habits.findIndex(h => h.id === habitId);
  if (idx !== -1) {
    if (!cache.habits[idx].completions) cache.habits[idx].completions = {};
    cache.habits[idx].completions[date] = !cache.habits[idx].completions[date];
    if (!cache.habits[idx].completions[date]) delete cache.habits[idx].completions[date];
    persistHabits();
    return cache.habits[idx].completions[date] || false;
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
  return cache.moods;
}

export function setMoods(moods) {
  cache.moods = moods;
  persistMoods();
}

export function addMood(entry) {
  const existing = cache.moods.findIndex(m => m.date === entry.date);
  if (existing !== -1) {
    cache.moods[existing] = { ...cache.moods[existing], ...entry };
  } else {
    cache.moods.push(entry);
  }
  persistMoods();
  return entry;
}

export function getMoodByDate(date) {
  return cache.moods.find(m => m.date === date) || null;
}

export function getMoodsByRange(startDate, endDate) {
  return cache.moods.filter(m => m.date >= startDate && m.date <= endDate);
}

export function getAverageMood(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const recent = cache.moods.filter(m => m.date >= cutoffStr && m.mood);
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
  return {
    meplus_user: cache.user,
    meplus_routines: cache.routines,
    meplus_habits: cache.habits,
    meplus_moods: cache.moods,
    meplus_completions: cache.completions,
  };
}

export async function importAllData(data) {
  // Support both old localStorage key format and raw format
  if (data.meplus_user !== undefined) cache.user = data.meplus_user;
  if (data.meplus_routines !== undefined) cache.routines = data.meplus_routines || [];
  if (data.meplus_habits !== undefined) cache.habits = data.meplus_habits || [];
  if (data.meplus_moods !== undefined) cache.moods = data.meplus_moods || [];
  if (data.meplus_completions !== undefined) cache.completions = data.meplus_completions || {};

  // Persist everything to IndexedDB
  if (cache.user) await db.user.put({ id: 1, ...cache.user });

  await db.transaction('rw', db.routines, async () => {
    await db.routines.clear();
    if (cache.routines.length > 0) await db.routines.bulkPut(cache.routines);
  });

  await db.transaction('rw', db.habits, async () => {
    await db.habits.clear();
    if (cache.habits.length > 0) await db.habits.bulkPut(cache.habits);
  });

  await db.transaction('rw', db.moods, async () => {
    await db.moods.clear();
    if (cache.moods.length > 0) await db.moods.bulkPut(cache.moods);
  });

  await db.transaction('rw', db.completions, async () => {
    await db.completions.clear();
    const entries = Object.entries(cache.completions).map(([date, tasks]) => ({ date, tasks }));
    if (entries.length > 0) await db.completions.bulkPut(entries);
  });
}

export async function clearAllData() {
  // Clear cache
  cache.user = null;
  cache.routines = [];
  cache.habits = [];
  cache.moods = [];
  cache.completions = {};

  // Clear IndexedDB
  await db.user.clear();
  await db.routines.clear();
  await db.habits.clear();
  await db.moods.clear();
  await db.completions.clear();

  // Also clear legacy localStorage
  Object.values(LS_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
