// ============================================
// Me+ Clone — Profile Page
// ============================================

import { getUser, setUser, getStats, exportAllData, importAllData, clearAllData } from '../store.js';
import { escapeHtml, formatDateShort, icons, moodEmojis } from '../utils.js';
import { showToast } from '../components/Toast.js';
import { showModal, closeModal } from '../components/Modal.js';
import { navigate } from '../router.js';

export function renderProfile() {
  const user = getUser() || {};
  const stats = getStats();
  const memberSince = user.createdAt ? formatDateShort(user.createdAt) : 'Today';

  return `
    <div class="page" id="profile-page">
      <!-- Profile Header -->
      <div style="text-align:center; margin-bottom:var(--space-2xl);">
        <div class="profile-avatar">👤</div>
        <h1 class="heading-2">${escapeHtml(user.name || 'Friend')}</h1>
        <div class="text-sm text-secondary mt-sm">Member since ${memberSince}</div>
        ${user.goal ? `
          <div class="card mt-lg" style="background:var(--gradient-card); text-align:left;">
            <div class="text-xs text-secondary" style="font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">My Goal</div>
            <div class="text-sm" style="font-style:italic;">"${escapeHtml(user.goal)}"</div>
          </div>
        ` : ''}
      </div>
      
      <!-- Stats Grid -->
      <div class="section-title mb-md">Your Stats</div>
      <div class="grid-2 mb-xl">
        <div class="card stat-card">
          <div class="stat-value">${stats.totalHabits}</div>
          <div class="stat-label">Habits</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${stats.longestStreak}</div>
          <div class="stat-label">Best Streak</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${stats.totalTasksCompleted}</div>
          <div class="stat-label">Tasks Done</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${stats.daysJournaled}</div>
          <div class="stat-label">Days Journaled</div>
        </div>
      </div>
      
      ${stats.averageMood > 0 ? `
        <div class="card flex items-center gap-lg mb-xl">
          <span style="font-size:2rem;">${moodEmojis[Math.round(stats.averageMood) - 1]?.emoji || '😐'}</span>
          <div>
            <div style="font-weight:700; font-family:var(--font-heading);">Average Mood</div>
            <div class="text-sm text-secondary">${stats.averageMood.toFixed(1)} / 5 (last 30 days)</div>
          </div>
        </div>
      ` : ''}
      
      <!-- Settings -->
      <div class="section-title mb-md">Settings</div>
      <div class="card mb-xl" style="padding:var(--space-sm);">
        <!-- Theme Toggle -->
        <div class="settings-item" id="toggle-theme">
          <div class="settings-item-icon" style="background:var(--accent-primary-bg);">
            ${document.documentElement.getAttribute('data-theme') === 'dark' ? '🌙' : '☀️'}
          </div>
          <div class="settings-item-text">
            <div class="settings-item-title">Dark Mode</div>
            <div class="settings-item-desc">Toggle between light and dark theme</div>
          </div>
          <div class="toggle ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'active' : ''}" id="theme-toggle"></div>
        </div>
        
        <!-- Edit Profile -->
        <div class="settings-item" id="edit-profile-btn">
          <div class="settings-item-icon" style="background:var(--accent-secondary-bg);">
            ✏️
          </div>
          <div class="settings-item-text">
            <div class="settings-item-title">Edit Profile</div>
            <div class="settings-item-desc">Update your name and goals</div>
          </div>
          <span class="settings-item-chevron">${icons.chevronRight}</span>
        </div>
        
        <!-- Export Data -->
        <div class="settings-item" id="export-data-btn">
          <div class="settings-item-icon" style="background:var(--accent-tertiary-bg);">
            📤
          </div>
          <div class="settings-item-text">
            <div class="settings-item-title">Export Data</div>
            <div class="settings-item-desc">Download all your data as JSON</div>
          </div>
          <span class="settings-item-chevron">${icons.chevronRight}</span>
        </div>
        
        <!-- Import Data -->
        <div class="settings-item" id="import-data-btn">
          <div class="settings-item-icon" style="background:var(--accent-warning-bg);">
            📥
          </div>
          <div class="settings-item-text">
            <div class="settings-item-title">Import Data</div>
            <div class="settings-item-desc">Restore from a JSON backup</div>
          </div>
          <span class="settings-item-chevron">${icons.chevronRight}</span>
        </div>
        
        <!-- Reset Onboarding -->
        <div class="settings-item" id="reset-onboarding-btn">
          <div class="settings-item-icon" style="background:var(--accent-primary-bg);">
            🔄
          </div>
          <div class="settings-item-text">
            <div class="settings-item-title">Reset Onboarding</div>
            <div class="settings-item-desc">Go through setup again</div>
          </div>
          <span class="settings-item-chevron">${icons.chevronRight}</span>
        </div>
        
        <!-- Clear All Data -->
        <div class="settings-item" id="clear-data-btn">
          <div class="settings-item-icon" style="background:var(--accent-danger-bg);">
            🗑️
          </div>
          <div class="settings-item-text">
            <div class="settings-item-title" style="color:var(--accent-danger);">Clear All Data</div>
            <div class="settings-item-desc">Permanently delete everything</div>
          </div>
          <span class="settings-item-chevron">${icons.chevronRight}</span>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="text-center mb-xl" style="padding:var(--space-lg);">
        <div style="font-family:var(--font-heading); font-weight:800; font-size:var(--text-lg); background:var(--gradient-hero); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
          Me+
        </div>
        <div class="text-xs text-tertiary mt-sm">Your Personal Lifestyle Companion</div>
      </div>
    </div>
  `;
}

function showEditProfileModal() {
  const user = getUser() || {};

  const html = `
    <div class="input-group mb-lg">
      <label class="input-label">Your Name</label>
      <input type="text" class="input" id="edit-name" value="${escapeHtml(user.name || '')}" autocomplete="off">
    </div>
    <div class="input-group mb-lg">
      <label class="input-label">Your Goal</label>
      <textarea class="input textarea" id="edit-goal" style="min-height:80px;">${escapeHtml(user.goal || '')}</textarea>
    </div>
    <div class="input-group mb-lg">
      <label class="input-label">Morning Start Time</label>
      <input type="time" class="input" id="edit-morning-time" value="${user.morningTime || '07:00'}">
    </div>
    <button class="btn btn-primary btn-block" id="save-profile-btn">Save Changes</button>
  `;

  showModal('Edit Profile', html);

  setTimeout(() => {
    document.getElementById('save-profile-btn')?.addEventListener('click', () => {
      const name = document.getElementById('edit-name').value.trim() || 'Friend';
      const goal = document.getElementById('edit-goal').value.trim();
      const morningTime = document.getElementById('edit-morning-time').value || '07:00';

      setUser({ ...user, name, goal, morningTime });
      closeModal();
      showToast('Profile updated! ✅', 'success');
      window.dispatchEvent(new Event('page-refresh'));
    });
  }, 100);
}

export function initProfile() {
  const page = document.getElementById('profile-page');
  if (!page) return;

  page.addEventListener('click', (e) => {
    // Theme toggle
    if (e.target.closest('#toggle-theme')) {
      const current = document.documentElement.getAttribute('data-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);

      const user = getUser();
      if (user) setUser({ ...user, theme: newTheme });

      window.dispatchEvent(new Event('page-refresh'));
      return;
    }

    // Edit profile
    if (e.target.closest('#edit-profile-btn')) {
      showEditProfileModal();
      return;
    }

    // Export data
    if (e.target.closest('#export-data-btn')) {
      const data = exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meplus-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported! 📤', 'success');
      return;
    }

    // Import data
    if (e.target.closest('#import-data-btn')) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            await importAllData(data);
            showToast('Data imported successfully! 📥', 'success');
            window.dispatchEvent(new Event('page-refresh'));
          } catch {
            showToast('Invalid file format', 'error');
          }
        };
        reader.readAsText(file);
      };
      input.click();
      return;
    }

    // Reset onboarding
    if (e.target.closest('#reset-onboarding-btn')) {
      if (confirm('This will show the onboarding flow again. Your data will be kept. Continue?')) {
        const user = getUser();
        if (user) setUser({ ...user, onboardingComplete: false });
        window.dispatchEvent(new Event('app-init'));
      }
      return;
    }

    // Clear all data
    if (e.target.closest('#clear-data-btn')) {
      if (confirm('⚠️ This will permanently delete ALL your data including habits, routines, mood entries, and journal. This cannot be undone.\n\nAre you sure?')) {
        clearAllData().then(() => {
          showToast('All data cleared', 'info');
          window.dispatchEvent(new Event('app-init'));
        });
      }
      return;
    }
  });
}
