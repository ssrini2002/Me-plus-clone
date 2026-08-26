// ============================================
// Me+ Clone — Habits Page
// ============================================

import { getHabits, addHabit, updateHabit, deleteHabit, toggleHabitCompletion, getHabitStreak, getHabitBestStreak, getHabitCompletionRate } from '../store.js';
import { getToday, generateId, escapeHtml, habitIcons, habitColors, habitCategories, getDateNDaysAgo, icons } from '../utils.js';
import { showModal, closeModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';
import { habitPresets } from '../data/templates.js';

let viewMode = 'grid'; // 'grid' or 'list'

export function renderHabits() {
  const habits = getHabits();
  const today = getToday();
  
  return `
    <div class="page" id="habits-page">
      <div class="flex items-center justify-between mb-xl">
        <h1 class="heading-2">Habits</h1>
        <div class="flex gap-sm">
          <button class="btn btn-icon btn-ghost ${viewMode === 'grid' ? '' : ''}" id="view-grid" 
                  style="font-size:1.1rem; ${viewMode === 'grid' ? 'background:var(--accent-primary-bg);color:var(--accent-primary);' : ''}" title="Grid view">
            ▦
          </button>
          <button class="btn btn-icon btn-ghost" id="view-list" 
                  style="font-size:1.1rem; ${viewMode === 'list' ? 'background:var(--accent-primary-bg);color:var(--accent-primary);' : ''}" title="List view">
            ☰
          </button>
        </div>
      </div>
      
      ${habits.length > 0 ? `
        <!-- Today's Habits -->
        <div class="section-header">
          <span class="section-title">Today</span>
          <span class="text-sm text-secondary">${habits.filter(h => h.completions?.[today]).length}/${habits.length}</span>
        </div>
        
        <div class="${viewMode === 'grid' ? 'grid-2' : ''}" style="margin-bottom:var(--space-2xl);">
          ${habits.map(h => viewMode === 'grid' ? renderHabitCardGrid(h, today) : renderHabitCardList(h, today)).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">🔄</div>
          <div class="empty-state-title">Build your first habit</div>
          <div class="empty-state-text">Start small and stay consistent. Even one habit can transform your life.</div>
        </div>
      `}
      
      <!-- FAB -->
      <button class="fab" id="fab-add-habit" aria-label="Add habit">
        ${icons.plus}
      </button>
    </div>
  `;
}

function renderHabitCardGrid(habit, today) {
  const completed = habit.completions?.[today];
  const streak = getHabitStreak(habit);
  
  return `
    <div class="habit-card ${completed ? 'habit-done' : ''}" data-habit-id="${habit.id}" 
         style="${completed ? 'border-color:var(--accent-success); background:var(--accent-success-bg);' : ''}">
      <div class="flex items-center justify-between mb-md">
        <div class="habit-icon" style="background:${habit.color}20;">
          ${habit.icon}
        </div>
        <button class="btn btn-ghost" data-toggle-habit="${habit.id}" 
                style="width:28px;height:28px;padding:0;border-radius:50%;font-size:1rem;
                ${completed ? 'background:var(--accent-success);color:white;' : 'border:2px solid var(--border-medium);'}">
          ${completed ? '✓' : ''}
        </button>
      </div>
      <div style="font-weight:600; font-size:var(--text-sm); margin-bottom:4px;">${escapeHtml(habit.name)}</div>
      ${streak > 0 ? `<div class="habit-streak">🔥 ${streak} day${streak !== 1 ? 's' : ''}</div>` : 
        `<div style="font-size:var(--text-xs);color:var(--text-tertiary);">Start today!</div>`}
      <div style="margin-top:var(--space-sm);">
        ${renderMiniHeatmap(habit, 21)}
      </div>
    </div>
  `;
}

function renderHabitCardList(habit, today) {
  const completed = habit.completions?.[today];
  const streak = getHabitStreak(habit);
  
  return `
    <div class="card flex items-center gap-md mb-md" data-habit-id="${habit.id}" style="cursor:pointer;
         ${completed ? 'border-color:var(--accent-success); background:var(--accent-success-bg);' : ''}">
      <button class="btn btn-ghost" data-toggle-habit="${habit.id}" 
              style="width:36px;height:36px;padding:0;border-radius:50%;font-size:1.25rem;flex-shrink:0;
              ${completed ? 'background:var(--accent-success);color:white;' : 'border:2px solid var(--border-medium);'}">
        ${completed ? '✓' : ''}
      </button>
      <div class="habit-icon" style="background:${habit.color}20; width:40px; height:40px; font-size:1.2rem;">
        ${habit.icon}
      </div>
      <div style="flex:1;">
        <div style="font-weight:600; font-size:var(--text-base);">${escapeHtml(habit.name)}</div>
        <div class="flex items-center gap-md mt-sm">
          ${streak > 0 ? `<span class="habit-streak" style="font-size:var(--text-xs);">🔥 ${streak}</span>` : ''}
          <span style="font-size:var(--text-xs);color:var(--text-tertiary);">
            ${habitCategories.find(c => c.id === habit.category)?.emoji || ''} ${habit.category || ''}
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderMiniHeatmap(habit, days) {
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = getDateNDaysAgo(i);
    const done = habit.completions?.[date];
    const opacity = done ? '1' : '0.15';
    const color = done ? habit.color : 'var(--text-tertiary)';
    cells.push(`<div class="heatmap-cell" style="background:${color}; opacity:${opacity};" title="${date}"></div>`);
  }
  return `<div class="heatmap-grid" style="grid-template-columns:repeat(7,1fr);gap:2px;">${cells.join('')}</div>`;
}

function showHabitDetail(habitId) {
  const habit = getHabits().find(h => h.id === habitId);
  if (!habit) return;
  
  const streak = getHabitStreak(habit);
  const bestStreak = getHabitBestStreak(habit);
  const rate = getHabitCompletionRate(habit);
  const totalCompletions = Object.values(habit.completions || {}).filter(Boolean).length;
  
  const html = `
    <div style="text-align:center; margin-bottom:var(--space-xl);">
      <div style="font-size:3rem; margin-bottom:var(--space-sm);">${habit.icon}</div>
      <div class="heading-3">${escapeHtml(habit.name)}</div>
      <div class="text-sm text-secondary mt-sm">${habitCategories.find(c => c.id === habit.category)?.label || habit.category || ''}</div>
    </div>
    
    <div class="grid-2 mb-xl">
      <div class="card stat-card">
        <div class="stat-value">${streak}</div>
        <div class="stat-label">Current Streak</div>
      </div>
      <div class="card stat-card">
        <div class="stat-value">${bestStreak}</div>
        <div class="stat-label">Best Streak</div>
      </div>
      <div class="card stat-card">
        <div class="stat-value">${totalCompletions}</div>
        <div class="stat-label">Total Done</div>
      </div>
      <div class="card stat-card">
        <div class="stat-value">${rate}%</div>
        <div class="stat-label">Completion Rate</div>
      </div>
    </div>
    
    <div class="section-title mb-md">Last 35 Days</div>
    <div style="margin-bottom:var(--space-xl);">
      ${renderMiniHeatmap(habit, 35)}
    </div>
    
    <div class="flex gap-md">
      <button class="btn btn-outline flex-1" id="edit-habit-btn">Edit</button>
      <button class="btn btn-ghost" id="delete-habit-btn" style="color:var(--accent-danger);">Delete</button>
    </div>
  `;
  
  showModal('', html);
  
  setTimeout(() => {
    document.getElementById('delete-habit-btn')?.addEventListener('click', () => {
      if (confirm('Delete this habit? This cannot be undone.')) {
        deleteHabit(habitId);
        closeModal();
        showToast('Habit deleted', 'info');
        window.dispatchEvent(new Event('page-refresh'));
      }
    });
    
    document.getElementById('edit-habit-btn')?.addEventListener('click', () => {
      closeModal();
      setTimeout(() => showAddHabitModal(habit), 450);
    });
  }, 100);
}

function showAddHabitModal(editHabit = null) {
  const isEdit = !!editHabit;
  
  const html = `
    <div class="input-group mb-lg">
      <label class="input-label">Habit Name</label>
      <input type="text" class="input" id="habit-name" value="${isEdit ? escapeHtml(editHabit.name) : ''}" 
             placeholder="e.g., Drink Water" autocomplete="off">
    </div>
    
    ${!isEdit ? `
    <div class="mb-lg">
      <label class="input-label mb-sm" style="display:block;">Quick Presets</label>
      <div class="flex flex-wrap gap-sm" id="habit-presets">
        ${habitPresets.slice(0, 8).map(p => `
          <button class="chip" data-preset='${JSON.stringify(p)}'>
            ${p.icon} ${p.name}
          </button>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    <div class="mb-lg">
      <label class="input-label mb-sm" style="display:block;">Icon</label>
      <div class="flex flex-wrap gap-sm" id="habit-icon-picker">
        ${habitIcons.map(icon => `
          <button class="chip habit-icon-opt ${(!isEdit && icon === '💧') || (isEdit && editHabit.icon === icon) ? 'active' : ''}" 
                  data-icon="${icon}" style="padding:8px;font-size:1.25rem;">
            ${icon}
          </button>
        `).join('')}
      </div>
    </div>
    
    <div class="mb-lg">
      <label class="input-label mb-sm" style="display:block;">Color</label>
      <div class="flex flex-wrap gap-sm" id="habit-color-picker">
        ${habitColors.map(color => `
          <button class="habit-color-opt" data-color="${color}" 
                  style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid ${(!isEdit && color === '#7C5CFC') || (isEdit && editHabit.color === color) ? 'var(--text-primary)' : 'transparent'};cursor:pointer;transition:all 0.15s;">
          </button>
        `).join('')}
      </div>
    </div>
    
    <div class="mb-lg">
      <label class="input-label mb-sm" style="display:block;">Category</label>
      <div class="flex flex-wrap gap-sm" id="habit-cat-picker">
        ${habitCategories.map(cat => `
          <button class="chip habit-cat-opt ${(!isEdit && cat.id === 'health') || (isEdit && editHabit.category === cat.id) ? 'active' : ''}" 
                  data-cat="${cat.id}">
            ${cat.emoji} ${cat.label}
          </button>
        `).join('')}
      </div>
    </div>
    
    <div class="input-group mb-lg">
      <label class="input-label">Reminder Time (optional)</label>
      <input type="time" class="input" id="habit-reminder" value="${isEdit && editHabit.reminderTime ? editHabit.reminderTime : ''}">
    </div>
    
    <button class="btn btn-primary btn-block" id="save-habit-btn">${isEdit ? 'Save Changes' : 'Create Habit'}</button>
  `;
  
  showModal(isEdit ? 'Edit Habit' : 'New Habit', html);
  
  let selectedIcon = isEdit ? editHabit.icon : '💧';
  let selectedColor = isEdit ? editHabit.color : '#7C5CFC';
  let selectedCat = isEdit ? editHabit.category : 'health';
  
  setTimeout(() => {
    const modal = document.getElementById('modal-content');
    if (!modal) return;
    
    // Preset click
    modal.addEventListener('click', (e) => {
      const preset = e.target.closest('[data-preset]');
      if (preset) {
        const p = JSON.parse(preset.dataset.preset);
        document.getElementById('habit-name').value = p.name;
        selectedIcon = p.icon;
        selectedColor = p.color;
        selectedCat = p.category;
        
        // Update UI
        modal.querySelectorAll('.habit-icon-opt').forEach(el => el.classList.toggle('active', el.dataset.icon === selectedIcon));
        modal.querySelectorAll('.habit-color-opt').forEach(el => el.style.borderColor = el.dataset.color === selectedColor ? 'var(--text-primary)' : 'transparent');
        modal.querySelectorAll('.habit-cat-opt').forEach(el => el.classList.toggle('active', el.dataset.cat === selectedCat));
      }
      
      const iconOpt = e.target.closest('.habit-icon-opt');
      if (iconOpt) {
        selectedIcon = iconOpt.dataset.icon;
        modal.querySelectorAll('.habit-icon-opt').forEach(el => el.classList.remove('active'));
        iconOpt.classList.add('active');
      }
      
      const colorOpt = e.target.closest('.habit-color-opt');
      if (colorOpt) {
        selectedColor = colorOpt.dataset.color;
        modal.querySelectorAll('.habit-color-opt').forEach(el => el.style.borderColor = 'transparent');
        colorOpt.style.borderColor = 'var(--text-primary)';
      }
      
      const catOpt = e.target.closest('.habit-cat-opt');
      if (catOpt) {
        selectedCat = catOpt.dataset.cat;
        modal.querySelectorAll('.habit-cat-opt').forEach(el => el.classList.remove('active'));
        catOpt.classList.add('active');
      }
    });
    
    // Save
    document.getElementById('save-habit-btn')?.addEventListener('click', () => {
      const name = document.getElementById('habit-name').value.trim();
      if (!name) { showToast('Please enter a habit name', 'error'); return; }
      
      const reminder = document.getElementById('habit-reminder').value || null;
      
      if (isEdit) {
        updateHabit(editHabit.id, {
          name,
          icon: selectedIcon,
          color: selectedColor,
          category: selectedCat,
          reminderTime: reminder,
        });
        showToast('Habit updated! ✅', 'success');
      } else {
        addHabit({
          id: generateId(),
          name,
          icon: selectedIcon,
          color: selectedColor,
          frequency: 'daily',
          category: selectedCat,
          reminderTime: reminder,
          createdAt: new Date().toISOString(),
          completions: {},
        });
        showToast('Habit created! 🎯', 'success');
      }
      
      closeModal();
      window.dispatchEvent(new Event('page-refresh'));
    });
    
    document.getElementById('habit-name')?.focus();
  }, 100);
}

export function initHabits() {
  const page = document.getElementById('habits-page');
  if (!page) return;
  
  page.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('[data-toggle-habit]');
    const habitCard = e.target.closest('[data-habit-id]');
    const fabBtn = e.target.closest('#fab-add-habit');
    const gridBtn = e.target.closest('#view-grid');
    const listBtn = e.target.closest('#view-list');
    
    if (toggleBtn) {
      e.stopPropagation();
      const habitId = toggleBtn.dataset.toggleHabit;
      const today = getToday();
      const result = toggleHabitCompletion(habitId, today);
      
      if (result) {
        showToast('Habit completed! 💪', 'success');
      }
      window.dispatchEvent(new Event('page-refresh'));
      return;
    }
    
    if (habitCard && !toggleBtn) {
      showHabitDetail(habitCard.dataset.habitId);
      return;
    }
    
    if (fabBtn) {
      showAddHabitModal();
      return;
    }
    
    if (gridBtn) {
      viewMode = 'grid';
      window.dispatchEvent(new Event('page-refresh'));
      return;
    }
    
    if (listBtn) {
      viewMode = 'list';
      window.dispatchEvent(new Event('page-refresh'));
      return;
    }
  });
}
