// ============================================
// Me+ Clone — Simple Hash Router
// ============================================

const routes = {};
let currentRoute = null;
let beforeNavigateHook = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  if (beforeNavigateHook) beforeNavigateHook(path);
  window.location.hash = path;
}

export function getCurrentRoute() {
  return currentRoute || 'today';
}

export function setBeforeNavigate(hook) {
  beforeNavigateHook = hook;
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || 'today';
  currentRoute = hash;
  
  const handler = routes[hash];
  if (handler) {
    handler();
  } else {
    // Default to today
    navigate('today');
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
