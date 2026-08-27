// ============================================
// Me+ Clone — Main Entry Point
// ============================================

import './index.css';
import { initStore, isOnboardingComplete, getUser } from './store.js';
import { registerRoute, initRouter, navigate } from './router.js';
import { renderBottomNav, initBottomNav } from './components/BottomNav.js';
import { renderOnboarding, initOnboarding } from './pages/Onboarding.js';
import { renderToday, initToday } from './pages/Today.js';
import { renderHabits, initHabits } from './pages/Habits.js';
import { renderMood, initMood } from './pages/Mood.js';
import { renderDiscover, initDiscover } from './pages/Discover.js';
import { renderProfile, initProfile } from './pages/Profile.js';

const app = document.getElementById('app');

// ---------- Apply saved theme ----------
function applyTheme() {
  const user = getUser();
  if (user?.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

// ---------- Render Page ----------
function renderPage(renderFn, initFn) {
  if (!isOnboardingComplete()) {
    app.innerHTML = renderOnboarding();
    initOnboarding();
    return;
  }
  
  app.innerHTML = renderFn() + renderBottomNav();
  initFn();
  initBottomNav();
}

// ---------- Register Routes ----------
registerRoute('today', () => renderPage(renderToday, initToday));
registerRoute('habits', () => renderPage(renderHabits, initHabits));
registerRoute('mood', () => renderPage(renderMood, initMood));
registerRoute('discover', () => renderPage(renderDiscover, initDiscover));
registerRoute('profile', () => renderPage(renderProfile, initProfile));

// ---------- Page Refresh (re-render current page) ----------
window.addEventListener('page-refresh', () => {
  const hash = window.location.hash.slice(1) || 'today';
  // Re-trigger the current route
  const event = new HashChangeEvent('hashchange');
  window.dispatchEvent(event);
});

// ---------- App Init (full restart) ----------
window.addEventListener('app-init', () => {
  applyTheme();
  
  if (!isOnboardingComplete()) {
    window.location.hash = '';
    app.innerHTML = renderOnboarding();
    initOnboarding();
  } else {
    const hash = window.location.hash.slice(1) || 'today';
    navigate(hash);
  }
});

// ---------- Bootstrap ----------
// Initialize IndexedDB store before rendering anything
(async () => {
  try {
    await initStore();
  } catch (err) {
    console.error('[MePlus] Failed to initialize database:', err);
  }

  applyTheme();
  initRouter();

  // Clean up default Vite files
  const defaultStyle = document.querySelector('link[href="/style.css"]');
  if (defaultStyle) defaultStyle.remove();
})();

// ---------- Service Worker Registration ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[MePlus] Service Worker registered, scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[MePlus] Service Worker registration failed:', err);
      });
  });
}
