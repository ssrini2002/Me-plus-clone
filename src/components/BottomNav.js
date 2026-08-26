// ============================================
// Me+ Clone — Bottom Navigation Component
// ============================================

import { getCurrentRoute, navigate } from '../router.js';

const tabs = [
  { id: 'today', icon: '☀️', label: 'Today' },
  { id: 'habits', icon: '🔄', label: 'Habits' },
  { id: 'mood', icon: '😊', label: 'Mood' },
  { id: 'discover', icon: '📚', label: 'Discover' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

export function renderBottomNav() {
  const current = getCurrentRoute();
  
  return `
    <nav class="bottom-nav" id="bottom-nav">
      ${tabs.map(tab => `
        <button class="nav-item ${current === tab.id ? 'active' : ''}" 
                data-tab="${tab.id}" 
                id="nav-${tab.id}"
                aria-label="${tab.label}">
          <span class="nav-icon">${tab.icon}</span>
          <span>${tab.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

export function initBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  
  nav.addEventListener('click', (e) => {
    const item = e.target.closest('.nav-item');
    if (!item) return;
    
    const tab = item.dataset.tab;
    if (tab && tab !== getCurrentRoute()) {
      navigate(tab);
    }
  });
}
