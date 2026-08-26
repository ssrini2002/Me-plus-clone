// ============================================
// Me+ Clone — Utility Functions
// ============================================

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

export function formatDateDisplay(date) {
  const d = date instanceof Date ? date : new Date(date);
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

export function formatDateShort(date) {
  const d = date instanceof Date ? date : new Date(date);
  const options = { month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

export function getToday() {
  return formatDate(new Date());
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
  if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  if (hour < 21) return { text: 'Good evening', emoji: '🌅' };
  return { text: 'Good night', emoji: '🌙' };
}

export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function getDaysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
}

export function getDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

export function getWeekDayName(dayIndex, short = true) {
  const days = short
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

export function getMonthName(monthIndex, short = false) {
  const months = short
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
}

export function isToday(dateStr) {
  return dateStr === getToday();
}

export function isSameDay(d1, d2) {
  return formatDate(d1) === formatDate(d2);
}

export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural || singular + 's');
}

// SVG icon helpers (inline SVG strings for common icons)
export const icons = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  fire: `🔥`,
};

export const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Awful' },
  { value: 2, emoji: '😕', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

export const moodColors = {
  1: '#FF6B6B',
  2: '#FFB347',
  3: '#9CA3AF',
  4: '#4ECDC4',
  5: '#51CF66',
};

export const moodTags = [
  { id: 'work', emoji: '💼', label: 'Work' },
  { id: 'sleep', emoji: '😴', label: 'Sleep' },
  { id: 'exercise', emoji: '🏃', label: 'Exercise' },
  { id: 'social', emoji: '👥', label: 'Social' },
  { id: 'health', emoji: '🏥', label: 'Health' },
  { id: 'weather', emoji: '🌦️', label: 'Weather' },
  { id: 'food', emoji: '🍽️', label: 'Food' },
  { id: 'family', emoji: '👨‍👩‍👧', label: 'Family' },
  { id: 'hobby', emoji: '🎨', label: 'Hobby' },
  { id: 'stress', emoji: '😰', label: 'Stress' },
  { id: 'relax', emoji: '🧘', label: 'Relax' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
];

export const habitIcons = [
  '💧', '🏃', '📖', '🧘', '💪', '🥗', '😴', '📝',
  '🎯', '🧠', '❤️', '🌱', '☕', '🎵', '🖥️', '🚶',
  '🍎', '💊', '🧹', '📱', '🎮', '✍️', '🌅', '🌙',
  '🤸', '🚴', '🏊', '⏰', '🙏', '😊', '📚', '🎨',
];

export const habitColors = [
  '#7C5CFC', '#FF6B9D', '#4ECDC4', '#FFB347', '#51CF66',
  '#6C5CE7', '#FD79A8', '#00B894', '#FDCB6E', '#74B9FF',
  '#A29BFE', '#FF7675', '#55EFC4', '#FFEAA7', '#81ECEC',
];

export const habitCategories = [
  { id: 'health', emoji: '❤️', label: 'Health' },
  { id: 'mind', emoji: '🧠', label: 'Mind' },
  { id: 'productivity', emoji: '🎯', label: 'Productivity' },
  { id: 'social', emoji: '👥', label: 'Social' },
  { id: 'fitness', emoji: '💪', label: 'Fitness' },
  { id: 'selfcare', emoji: '🧘', label: 'Self-Care' },
  { id: 'custom', emoji: '⭐', label: 'Custom' },
];
