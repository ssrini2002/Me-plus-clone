// ============================================
// Me+ Clone — Mood Page
// ============================================

import { getMoods, addMood, getMoodByDate, getMoodsByRange, getAverageMood } from '../store.js';
import { getToday, formatDateDisplay, formatDateShort, generateId, escapeHtml, moodEmojis, moodColors, moodTags, getDateNDaysAgo, getDaysInMonth, getFirstDayOfMonth, getWeekDayName, getMonthName, isToday } from '../utils.js';
import { showToast } from '../components/Toast.js';

let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();
let chartRange = 30;

export function renderMood() {
  const today = getToday();
  const todayMood = getMoodByDate(today);
  const avgMood = getAverageMood(30);
  
  return `
    <div class="page" id="mood-page">
      <h1 class="heading-2 mb-xl">Mood & Journal</h1>
      
      <!-- Today's Check-in -->
      <div class="card mb-xl" style="background: var(--gradient-card);">
        <div class="section-title mb-md">How are you feeling?</div>
        
        <div class="mood-picker" id="mood-picker">
          ${moodEmojis.map(m => `
            <div class="mood-option ${todayMood?.mood === m.value ? 'selected' : ''}" data-mood="${m.value}">
              <span class="mood-emoji">${m.emoji}</span>
              <span class="mood-label">${m.label}</span>
            </div>
          `).join('')}
        </div>
        
        <!-- Tags (shown after mood selection) -->
        <div id="mood-tags-section" style="${todayMood?.mood ? '' : 'display:none;'}">
          <div class="text-sm text-secondary mb-sm" style="font-weight:600;">What's influencing your mood?</div>
          <div class="flex flex-wrap gap-sm mb-lg" id="mood-tags">
            ${moodTags.map(tag => `
              <button class="chip ${todayMood?.tags?.includes(tag.id) ? 'active' : ''}" data-tag="${tag.id}">
                ${tag.emoji} ${tag.label}
              </button>
            `).join('')}
          </div>
          
          <div class="input-group mb-md">
            <label class="input-label">Journal (optional)</label>
            <textarea class="input textarea" id="mood-journal" 
                      placeholder="How was your day? What's on your mind..."
                      style="min-height:80px;">${todayMood?.journal || ''}</textarea>
          </div>
          
          <button class="btn btn-primary btn-block" id="save-mood-btn">
            ${todayMood ? 'Update Entry' : 'Save Entry'} 💾
          </button>
        </div>
      </div>
      
      <!-- Average Mood -->
      ${avgMood > 0 ? `
        <div class="card mb-xl flex items-center gap-lg">
          <div style="font-size:2.5rem;">
            ${moodEmojis[Math.round(avgMood) - 1]?.emoji || '😐'}
          </div>
          <div>
            <div style="font-weight:700; font-family:var(--font-heading);">30-Day Average</div>
            <div class="text-sm text-secondary">${avgMood.toFixed(1)} / 5 — ${getMoodWord(avgMood)}</div>
          </div>
        </div>
      ` : ''}
      
      <!-- Mood Calendar -->
      <div class="card mb-xl">
        <div class="flex items-center justify-between mb-lg">
          <button class="btn btn-ghost btn-sm" id="cal-prev">‹</button>
          <span class="section-title">${getMonthName(calendarMonth)} ${calendarYear}</span>
          <button class="btn btn-ghost btn-sm" id="cal-next">›</button>
        </div>
        ${renderMoodCalendar()}
      </div>
      
      <!-- Mood Trend Chart -->
      <div class="card mb-xl">
        <div class="flex items-center justify-between mb-lg">
          <span class="section-title">Mood Trends</span>
          <div class="flex gap-sm">
            ${[7, 30, 90].map(d => `
              <button class="chip chip-sm ${chartRange === d ? 'active' : ''}" data-range="${d}">${d}d</button>
            `).join('')}
          </div>
        </div>
        <canvas id="mood-chart" width="400" height="180" style="width:100%;height:180px;"></canvas>
      </div>
      
      <!-- Mood Insights -->
      ${renderMoodInsights()}
      
      <!-- Journal Entries -->
      <div class="section-header">
        <span class="section-title">Journal Entries</span>
      </div>
      ${renderJournalEntries()}
    </div>
  `;
}

function getMoodWord(avg) {
  if (avg >= 4.5) return 'Excellent!';
  if (avg >= 3.5) return 'Pretty good';
  if (avg >= 2.5) return 'Getting there';
  if (avg >= 1.5) return 'Hang in there';
  return 'Tough times';
}

function renderMoodCalendar() {
  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
  const moods = getMoods();
  const today = getToday();
  
  const moodMap = {};
  moods.forEach(m => { moodMap[m.date] = m; });
  
  let cells = '';
  
  // Day headers
  for (let i = 0; i < 7; i++) {
    cells += `<div class="calendar-header-cell">${getWeekDayName(i)}</div>`;
  }
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells += `<div class="calendar-cell" style="opacity:0;"></div>`;
  }
  
  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const moodEntry = moodMap[dateStr];
    const isTodayCell = dateStr === today;
    
    let bgStyle = '';
    let dotStyle = '';
    if (moodEntry?.mood) {
      const color = moodColors[moodEntry.mood];
      bgStyle = `background: ${color}25;`;
      dotStyle = `background: ${color};`;
    }
    
    cells += `
      <div class="calendar-cell ${isTodayCell ? 'today' : ''}" style="${bgStyle}" data-cal-date="${dateStr}">
        ${d}
        ${moodEntry?.mood ? `<span style="position:absolute;bottom:2px;width:5px;height:5px;border-radius:50%;${dotStyle}"></span>` : ''}
      </div>
    `;
  }
  
  return `<div class="calendar-grid">${cells}</div>`;
}

function renderMoodInsights() {
  const moods = getMoods().filter(m => m.tags && m.tags.length > 0);
  if (moods.length < 5) return '';
  
  // Find correlations between tags and high/low moods
  const tagMoods = {};
  moods.forEach(m => {
    m.tags.forEach(tag => {
      if (!tagMoods[tag]) tagMoods[tag] = [];
      tagMoods[tag].push(m.mood);
    });
  });
  
  const insights = [];
  Object.entries(tagMoods).forEach(([tag, values]) => {
    if (values.length < 3) return;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const tagInfo = moodTags.find(t => t.id === tag);
    if (!tagInfo) return;
    
    if (avg >= 3.8) {
      insights.push({ text: `You tend to feel better on days involving ${tagInfo.label.toLowerCase()}`, emoji: '📈', positive: true });
    } else if (avg <= 2.5) {
      insights.push({ text: `${tagInfo.label} days tend to bring your mood down`, emoji: '📉', positive: false });
    }
  });
  
  if (insights.length === 0) return '';
  
  return `
    <div class="card mb-xl" style="background: var(--accent-primary-bg); border-color: var(--accent-primary);">
      <div class="section-title mb-md">💡 Insights</div>
      ${insights.slice(0, 3).map(i => `
        <div class="flex items-center gap-sm mb-sm">
          <span>${i.emoji}</span>
          <span class="text-sm">${i.text}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderJournalEntries() {
  const moods = getMoods()
    .filter(m => m.journal && m.journal.trim())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
  
  if (moods.length === 0) {
    return `
      <div class="text-center text-secondary text-sm" style="padding:var(--space-xl) 0;">
        Your journal entries will appear here
      </div>
    `;
  }
  
  return moods.map(m => `
    <div class="card mb-md">
      <div class="flex items-center justify-between mb-sm">
        <div class="flex items-center gap-sm">
          <span style="font-size:1.25rem;">${moodEmojis[m.mood - 1]?.emoji || '😐'}</span>
          <span class="text-sm" style="font-weight:600;">${formatDateShort(m.date)}</span>
        </div>
        ${m.tags?.length > 0 ? `
          <div class="flex gap-xs">
            ${m.tags.slice(0, 3).map(t => {
              const tag = moodTags.find(mt => mt.id === t);
              return tag ? `<span class="chip chip-sm" style="pointer-events:none;padding:2px 6px;">${tag.emoji}</span>` : '';
            }).join('')}
          </div>
        ` : ''}
      </div>
      <div class="text-sm" style="color:var(--text-secondary);line-height:1.6;">${escapeHtml(m.journal)}</div>
    </div>
  `).join('');
}

function drawMoodChart() {
  const canvas = document.getElementById('mood-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const width = rect.width;
  const height = rect.height;
  const padding = { top: 10, right: 10, bottom: 25, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  
  // Get data
  const dataPoints = [];
  for (let i = chartRange - 1; i >= 0; i--) {
    const date = getDateNDaysAgo(i);
    const mood = getMoodByDate(date);
    dataPoints.push({ date, mood: mood?.mood || null });
  }
  
  const validPoints = dataPoints.filter(d => d.mood !== null);
  
  // Clear
  ctx.clearRect(0, 0, width, height);
  
  // Y-axis labels
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim();
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 1; i <= 5; i++) {
    const y = padding.top + chartH - ((i - 1) / 4) * chartH;
    ctx.fillText(moodEmojis[i - 1].emoji, padding.left - 5, y + 4);
    
    // Grid line
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim();
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  if (validPoints.length < 2) {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim();
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Log more moods to see trends', width / 2, height / 2);
    return;
  }
  
  // Draw line
  const getX = (i) => padding.left + (i / (dataPoints.length - 1)) * chartW;
  const getY = (mood) => padding.top + chartH - ((mood - 1) / 4) * chartH;
  
  // Gradient fill under curve
  const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  gradient.addColorStop(0, 'rgba(124, 92, 252, 0.2)');
  gradient.addColorStop(1, 'rgba(124, 92, 252, 0.0)');
  
  ctx.beginPath();
  let started = false;
  let firstIdx = -1;
  let lastIdx = -1;
  
  dataPoints.forEach((d, i) => {
    if (d.mood === null) return;
    const x = getX(i);
    const y = getY(d.mood);
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
      firstIdx = i;
    } else {
      ctx.lineTo(x, y);
    }
    lastIdx = i;
  });
  
  // Stroke the line
  ctx.strokeStyle = '#7C5CFC';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Fill area
  if (firstIdx >= 0 && lastIdx >= 0) {
    ctx.lineTo(getX(lastIdx), height - padding.bottom);
    ctx.lineTo(getX(firstIdx), height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  
  // Draw dots
  dataPoints.forEach((d, i) => {
    if (d.mood === null) return;
    const x = getX(i);
    const y = getY(d.mood);
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = moodColors[d.mood];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  
  // X-axis labels
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim();
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  const labelInterval = Math.ceil(dataPoints.length / 6);
  dataPoints.forEach((d, i) => {
    if (i % labelInterval === 0 || i === dataPoints.length - 1) {
      const x = getX(i);
      const dateObj = new Date(d.date);
      ctx.fillText(`${dateObj.getDate()}/${dateObj.getMonth() + 1}`, x, height - 3);
    }
  });
}

let currentMoodSelection = null;
let currentTagsSelection = [];

export function initMood() {
  const page = document.getElementById('mood-page');
  if (!page) return;
  
  const todayMood = getMoodByDate(getToday());
  currentMoodSelection = todayMood?.mood || null;
  currentTagsSelection = todayMood?.tags ? [...todayMood.tags] : [];
  
  // Draw chart after render
  setTimeout(() => drawMoodChart(), 100);
  
  page.addEventListener('click', (e) => {
    // Mood selection
    const moodOpt = e.target.closest('.mood-option');
    if (moodOpt) {
      currentMoodSelection = parseInt(moodOpt.dataset.mood);
      
      // Update UI
      page.querySelectorAll('.mood-option').forEach(el => {
        el.classList.toggle('selected', parseInt(el.dataset.mood) === currentMoodSelection);
      });
      
      // Show tags section
      document.getElementById('mood-tags-section').style.display = '';
      return;
    }
    
    // Tag selection
    const tagChip = e.target.closest('#mood-tags .chip');
    if (tagChip) {
      const tagId = tagChip.dataset.tag;
      const idx = currentTagsSelection.indexOf(tagId);
      if (idx !== -1) {
        currentTagsSelection.splice(idx, 1);
        tagChip.classList.remove('active');
      } else {
        currentTagsSelection.push(tagId);
        tagChip.classList.add('active');
      }
      return;
    }
    
    // Save mood
    const saveBtn = e.target.closest('#save-mood-btn');
    if (saveBtn) {
      if (!currentMoodSelection) { showToast('Please select a mood', 'error'); return; }
      
      const journal = document.getElementById('mood-journal')?.value?.trim() || '';
      
      addMood({
        id: generateId(),
        date: getToday(),
        mood: currentMoodSelection,
        tags: currentTagsSelection,
        journal,
        createdAt: new Date().toISOString(),
      });
      
      showToast('Mood logged! ' + moodEmojis[currentMoodSelection - 1].emoji, 'success');
      window.dispatchEvent(new Event('page-refresh'));
      return;
    }
    
    // Calendar nav
    if (e.target.closest('#cal-prev')) {
      calendarMonth--;
      if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
      window.dispatchEvent(new Event('page-refresh'));
      return;
    }
    if (e.target.closest('#cal-next')) {
      calendarMonth++;
      if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
      window.dispatchEvent(new Event('page-refresh'));
      return;
    }
    
    // Chart range
    const rangeChip = e.target.closest('[data-range]');
    if (rangeChip) {
      chartRange = parseInt(rangeChip.dataset.range);
      window.dispatchEvent(new Event('page-refresh'));
      return;
    }
  });
}
