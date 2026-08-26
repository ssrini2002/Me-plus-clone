// ============================================
// Me+ Clone — Today Page (Daily Dashboard)
// ============================================

import { getUser, getRoutines, getCompletions, setTaskCompletion, addRoutine, updateRoutine, deleteRoutine, getHabits, getHabitStreak } from '../store.js';
import { getToday, formatDateDisplay, getGreeting, generateId, icons, escapeHtml } from '../utils.js';
import { showModal, closeModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';

export function renderToday() {
  const user = getUser();
  const routines = getRoutines();
  const today = getToday();
  const completions = getCompletions(today);
  const greeting = getGreeting();
  const habits = getHabits();
  
  // Calculate progress
  let totalTasks = 0;
  let completedTasks = 0;
  routines.forEach(r => {
    r.tasks.forEach(t => {
      totalTasks++;
      if (completions[t.id]) completedTasks++;
    });
  });
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate max streak from habits
  let maxStreak = 0;
  habits.forEach(h => {
    const streak = getHabitStreak(h);
    if (streak > maxStreak) maxStreak = streak;
  });
  
  // Group routines by time of day
  const routineGroups = {
    morning: { icon: '🌅', label: 'Morning', routines: [] },
    afternoon: { icon: '☀️', label: 'Afternoon', routines: [] },
    evening: { icon: '🌙', label: 'Evening', routines: [] },
  };
  
  routines.forEach(r => {
    const group = routineGroups[r.timeOfDay] || routineGroups.morning;
    group.routines.push(r);
  });
  
  return `
    <div class="page" id="today-page">
      <!-- Header -->
      <div style="margin-bottom:var(--space-xl);">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-secondary">${formatDateDisplay(new Date())}</div>
            <h1 class="heading-2">${greeting.emoji} ${greeting.text}, ${escapeHtml(user?.name || 'Friend')}</h1>
          </div>
          ${maxStreak > 0 ? `
            <div class="habit-streak" style="font-size:var(--text-base);">
              🔥 ${maxStreak}
            </div>
          ` : ''}
        </div>
      </div>
      
      <!-- Progress Card -->
      <div class="card" style="background: var(--gradient-hero); color:white; margin-bottom:var(--space-xl); border:none;">
        <div class="flex items-center gap-lg">
          <div class="progress-ring-container">
            ${renderProgressRing(progress, 72, 6)}
          </div>
          <div style="flex:1;">
            <div style="font-family:var(--font-heading); font-size:var(--text-lg); font-weight:700;">
              Today's Progress
            </div>
            <div style="font-size:var(--text-sm); opacity:0.85; margin-top:4px;">
              ${completedTasks} of ${totalTasks} tasks completed
            </div>
            ${progress === 100 && totalTasks > 0 ? `
              <div style="font-size:var(--text-sm); margin-top:8px; font-weight:600;">
                🎉 Perfect day! You crushed it!
              </div>
            ` : ''}
          </div>
        </div>
      </div>
      
      <!-- Routines -->
      ${Object.entries(routineGroups).map(([key, group]) => {
        if (group.routines.length === 0) return '';
        return renderRoutineGroup(key, group, completions);
      }).join('')}
      
      ${totalTasks === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">No routines yet</div>
          <div class="empty-state-text">Head to the Discover tab to add routine templates, or create your own!</div>
          <button class="btn btn-primary mt-lg" id="add-routine-btn">
            Create Routine
          </button>
        </div>
      ` : ''}
      
      <!-- FAB -->
      <button class="fab" id="fab-add-task" aria-label="Add task">
        ${icons.plus}
      </button>
    </div>
  `;
}

function renderProgressRing(percent, size, strokeWidth) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const center = size / 2;
  
  return `
    <svg width="${size}" height="${size}" class="progress-ring-container">
      <circle cx="${center}" cy="${center}" r="${radius}" 
              fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="${strokeWidth}"/>
      <circle cx="${center}" cy="${center}" r="${radius}" 
              fill="none" stroke="white" stroke-width="${strokeWidth}"
              stroke-dasharray="${circumference}" 
              stroke-dashoffset="${offset}"
              stroke-linecap="round"
              class="progress-ring-circle"
              style="transform:rotate(-90deg); transform-origin:center;"/>
      <text x="${center}" y="${center}" text-anchor="middle" dominant-baseline="central"
            fill="white" font-family="var(--font-heading)" font-weight="700" 
            font-size="${size * 0.22}px">
        ${percent}%
      </text>
    </svg>
  `;
}

function renderRoutineGroup(key, group, completions) {
  let groupTotalTasks = 0;
  let groupCompletedTasks = 0;
  group.routines.forEach(r => {
    r.tasks.forEach(t => {
      groupTotalTasks++;
      if (completions[t.id]) groupCompletedTasks++;
    });
  });
  
  return `
    <div class="routine-section" data-group="${key}">
      <div class="routine-header" data-toggle="${key}">
        <span class="routine-header-icon">${group.icon}</span>
        <span class="routine-header-title">${group.label}</span>
        <span class="routine-header-count">${groupCompletedTasks}/${groupTotalTasks}</span>
        <span class="routine-header-chevron" id="chevron-${key}">${icons.chevronDown}</span>
      </div>
      <div class="routine-tasks" id="tasks-${key}">
        ${group.routines.map(routine => `
          <div class="routine-card mb-md" data-routine-id="${routine.id}">
            <div class="flex items-center justify-between mb-md" style="padding: 0 var(--space-sm);">
              <span style="font-weight:600; font-size:var(--text-sm); color:var(--text-secondary);">
                ${escapeHtml(routine.name)}
              </span>
              <div class="flex gap-xs">
                <button class="btn btn-ghost btn-icon" data-edit-routine="${routine.id}" 
                        style="width:32px;height:32px;" title="Edit routine">
                  <span style="width:16px;height:16px;display:flex;">${icons.edit}</span>
                </button>
                <button class="btn btn-ghost btn-icon" data-delete-routine="${routine.id}" 
                        style="width:32px;height:32px;color:var(--accent-danger);" title="Delete routine">
                  <span style="width:16px;height:16px;display:flex;">${icons.trash}</span>
                </button>
              </div>
            </div>
            ${routine.tasks.map(task => renderTaskItem(task, completions[task.id])).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderTaskItem(task, completed) {
  return `
    <div class="task-item" data-task-id="${task.id}">
      <div class="task-checkbox ${completed ? 'checked' : ''}">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style="flex:1;">
        <div class="task-text ${completed ? 'completed' : ''}">${escapeHtml(task.text)}</div>
        ${task.subTasks && task.subTasks.length > 0 ? `
          <div style="margin-top:4px; padding-left:4px;">
            ${task.subTasks.map(st => `
              <div style="font-size:var(--text-xs); color:var(--text-tertiary); padding:2px 0;">
                · ${escapeHtml(st)}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${task.timeEstimate ? `
          <div class="task-time">⏱️ ${task.timeEstimate} min</div>
        ` : ''}
      </div>
    </div>
  `;
}

function showAddTaskModal() {
  const routines = getRoutines();
  
  let html = `
    <div class="input-group mb-lg">
      <label class="input-label">Task Name</label>
      <input type="text" class="input" id="new-task-text" placeholder="What do you need to do?" autocomplete="off">
    </div>
    <div class="input-group mb-lg">
      <label class="input-label">Sub-tasks (one per line, optional)</label>
      <textarea class="input textarea" id="new-task-subs" placeholder="Break it into smaller steps..." style="min-height:60px;"></textarea>
    </div>
    <div class="input-group mb-lg">
      <label class="input-label">Time Estimate (minutes)</label>
      <input type="number" class="input" id="new-task-time" placeholder="5" min="1" max="999">
    </div>
    <div class="input-group mb-lg">
      <label class="input-label">Add to Routine</label>
      <select class="input" id="new-task-routine" style="padding:var(--space-md) var(--space-lg);">
        ${routines.length === 0 ? '<option value="new-morning">New Morning Routine</option>' : ''}
        ${routines.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
        <option value="new-morning">+ New Morning Routine</option>
        <option value="new-afternoon">+ New Afternoon Routine</option>
        <option value="new-evening">+ New Evening Routine</option>
      </select>
    </div>
    <button class="btn btn-primary btn-block" id="save-new-task">Add Task</button>
  `;
  
  showModal('Add Task', html);
  
  setTimeout(() => {
    document.getElementById('new-task-text')?.focus();
    
    document.getElementById('save-new-task')?.addEventListener('click', () => {
      const text = document.getElementById('new-task-text').value.trim();
      if (!text) { showToast('Please enter a task name', 'error'); return; }
      
      const subsText = document.getElementById('new-task-subs').value.trim();
      const subTasks = subsText ? subsText.split('\n').map(s => s.trim()).filter(Boolean) : [];
      const timeEstimate = parseInt(document.getElementById('new-task-time').value) || 0;
      const routineSelect = document.getElementById('new-task-routine').value;
      
      const newTask = {
        id: generateId(),
        text,
        subTasks,
        completed: false,
        timeEstimate: timeEstimate || null,
      };
      
      if (routineSelect.startsWith('new-')) {
        const timeOfDay = routineSelect.replace('new-', '');
        const labels = { morning: 'Morning Routine', afternoon: 'Afternoon Routine', evening: 'Evening Routine' };
        addRoutine({
          id: generateId(),
          name: labels[timeOfDay],
          timeOfDay,
          tasks: [newTask],
          order: getRoutines().length,
          createdAt: new Date().toISOString(),
        });
      } else {
        const routine = getRoutines().find(r => r.id === routineSelect);
        if (routine) {
          routine.tasks.push(newTask);
          updateRoutine(routine.id, { tasks: routine.tasks });
        }
      }
      
      closeModal();
      showToast('Task added! ✅', 'success');
      window.dispatchEvent(new Event('page-refresh'));
    });
  }, 100);
}

function showEditRoutineModal(routineId) {
  const routine = getRoutines().find(r => r.id === routineId);
  if (!routine) return;
  
  let html = `
    <div class="input-group mb-lg">
      <label class="input-label">Routine Name</label>
      <input type="text" class="input" id="edit-routine-name" value="${escapeHtml(routine.name)}" autocomplete="off">
    </div>
    <div class="input-group mb-lg">
      <label class="input-label">Time of Day</label>
      <select class="input" id="edit-routine-time" style="padding:var(--space-md) var(--space-lg);">
        <option value="morning" ${routine.timeOfDay === 'morning' ? 'selected' : ''}>🌅 Morning</option>
        <option value="afternoon" ${routine.timeOfDay === 'afternoon' ? 'selected' : ''}>☀️ Afternoon</option>
        <option value="evening" ${routine.timeOfDay === 'evening' ? 'selected' : ''}>🌙 Evening</option>
      </select>
    </div>
    <button class="btn btn-primary btn-block" id="save-edit-routine">Save Changes</button>
  `;
  
  showModal('Edit Routine', html);
  
  setTimeout(() => {
    document.getElementById('save-edit-routine')?.addEventListener('click', () => {
      const name = document.getElementById('edit-routine-name').value.trim();
      const timeOfDay = document.getElementById('edit-routine-time').value;
      if (!name) { showToast('Please enter a name', 'error'); return; }
      
      updateRoutine(routineId, { name, timeOfDay });
      closeModal();
      showToast('Routine updated! ✅', 'success');
      window.dispatchEvent(new Event('page-refresh'));
    });
  }, 100);
}

export function initToday() {
  const page = document.getElementById('today-page');
  if (!page) return;
  
  // Task checkbox toggle
  page.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    const fabBtn = e.target.closest('#fab-add-task');
    const addRoutineBtn = e.target.closest('#add-routine-btn');
    const editRoutineBtn = e.target.closest('[data-edit-routine]');
    const deleteRoutineBtn = e.target.closest('[data-delete-routine]');
    const toggleHeader = e.target.closest('.routine-header');
    
    if (taskItem) {
      const taskId = taskItem.dataset.taskId;
      const today = getToday();
      const completions = getCompletions(today);
      const newState = !completions[taskId];
      setTaskCompletion(today, taskId, newState);
      
      // Re-render the page
      window.dispatchEvent(new Event('page-refresh'));
    }
    
    if (fabBtn || addRoutineBtn) {
      showAddTaskModal();
    }
    
    if (editRoutineBtn) {
      e.stopPropagation();
      showEditRoutineModal(editRoutineBtn.dataset.editRoutine);
    }
    
    if (deleteRoutineBtn) {
      e.stopPropagation();
      const id = deleteRoutineBtn.dataset.deleteRoutine;
      if (confirm('Delete this routine and all its tasks?')) {
        deleteRoutine(id);
        showToast('Routine deleted', 'info');
        window.dispatchEvent(new Event('page-refresh'));
      }
    }
    
    if (toggleHeader) {
      const key = toggleHeader.dataset.toggle;
      const tasksEl = document.getElementById(`tasks-${key}`);
      const chevron = document.getElementById(`chevron-${key}`);
      if (tasksEl) {
        if (tasksEl.style.display === 'none') {
          tasksEl.style.display = '';
          chevron?.classList.remove('collapsed');
        } else {
          tasksEl.style.display = 'none';
          chevron?.classList.add('collapsed');
        }
      }
    }
  });
}
