// ============================================
// Me+ Clone — Dexie Database Definition
// ============================================

import Dexie from 'dexie';

const db = new Dexie('MePlusDB');

db.version(1).stores({
  // Primary key is `id` for user (we'll use id=1 for the single user row)
  user: 'id',
  // Routines keyed by their generated id
  routines: 'id',
  // Habits keyed by their generated id
  habits: 'id',
  // Mood entries keyed by date string (YYYY-MM-DD)
  moods: 'date',
  // Task completions keyed by date string (YYYY-MM-DD)
  completions: 'date',
});

export default db;
