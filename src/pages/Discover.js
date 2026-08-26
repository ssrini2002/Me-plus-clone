// ============================================
// Me+ Clone — Discover Page
// ============================================

import { addRoutine, getRoutines } from '../store.js';
import { generateId, escapeHtml } from '../utils.js';
import { routineTemplates } from '../data/templates.js';
import { tips, tipCategories } from '../data/tips.js';
import { showToast } from '../components/Toast.js';
import { showModal, closeModal } from '../components/Modal.js';
import { navigate } from '../router.js';

let activeCategory = 'all';

export function renderDiscover() {
  return `
    <div class="page" id="discover-page">
      <h1 class="heading-2 mb-md">Discover</h1>
      <p class="text-sm text-secondary mb-xl">Ready-made routines and evidence-based tips to level up your life.</p>
      
      <!-- Routine Templates -->
      <div class="section-header">
        <span class="section-title">Routine Templates</span>
      </div>
      
      <div style="overflow-x:auto; margin:0 calc(-1 * var(--space-lg)); padding:0 var(--space-lg); margin-bottom:var(--space-2xl);">
        <div style="display:flex; gap:var(--space-md); padding-bottom:var(--space-sm);">
          ${routineTemplates.map(t => `
            <div class="template-card" style="min-width:240px; flex-shrink:0;" data-template-id="${t.id}">
              <div class="template-card-banner" style="background:${t.gradient};">
                ${t.emoji}
              </div>
              <div class="template-card-body">
                <div class="template-card-title">${t.name}</div>
                <div class="template-card-desc">${t.description}</div>
                <div class="template-card-meta">
                  <span class="template-card-time">⏱️ ${t.duration}</span>
                  <span class="chip chip-sm" style="pointer-events:none;">${t.tasks.length} tasks</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Self-Care Tips -->
      <div class="section-header">
        <span class="section-title">Self-Care Tips</span>
      </div>
      
      <div class="flex flex-wrap gap-sm mb-lg" id="tip-filters">
        ${tipCategories.map(cat => `
          <button class="chip ${activeCategory === cat.id ? 'active' : ''}" data-tip-cat="${cat.id}">
            ${cat.emoji} ${cat.label}
          </button>
        `).join('')}
      </div>
      
      <div id="tips-grid">
        ${renderTips()}
      </div>
    </div>
  `;
}

function renderTips() {
  const filtered = activeCategory === 'all' 
    ? tips 
    : tips.filter(t => t.category === activeCategory);
  
  return filtered.map(tip => `
    <div class="card mb-md" style="border-left: 3px solid ${tip.color};">
      <div class="flex items-center gap-md mb-sm">
        <span style="font-size:1.5rem;">${tip.emoji}</span>
        <div>
          <div style="font-weight:700; font-family:var(--font-heading);">${tip.title}</div>
          <span class="chip chip-sm" style="pointer-events:none; margin-top:4px;">
            ${tipCategories.find(c => c.id === tip.category)?.emoji || ''} ${tip.category}
          </span>
        </div>
      </div>
      <p class="text-sm text-secondary" style="line-height:1.7;">${tip.content}</p>
    </div>
  `).join('');
}

function showTemplateDetail(templateId) {
  const template = routineTemplates.find(t => t.id === templateId);
  if (!template) return;
  
  const existingRoutines = getRoutines();
  const alreadyAdded = existingRoutines.some(r => r.name === template.name);
  
  const html = `
    <div style="text-align:center; margin-bottom:var(--space-xl);">
      <div style="width:80px;height:80px;border-radius:var(--radius-lg);background:${template.gradient};display:flex;align-items:center;justify-content:center;font-size:2.5rem;margin:0 auto var(--space-md);">
        ${template.emoji}
      </div>
      <div class="heading-3">${template.name}</div>
      <div class="text-sm text-secondary mt-sm">${template.description}</div>
      <div class="flex items-center justify-center gap-md mt-md">
        <span class="chip chip-sm" style="pointer-events:none;">⏱️ ${template.duration}</span>
        <span class="chip chip-sm" style="pointer-events:none;">📋 ${template.tasks.length} tasks</span>
      </div>
    </div>
    
    <div class="section-title mb-md">Tasks</div>
    ${template.tasks.map((task, i) => `
      <div class="flex items-start gap-md mb-md" style="padding:var(--space-sm);">
        <div style="width:24px;height:24px;border-radius:50%;background:${template.gradient};display:flex;align-items:center;justify-content:center;color:white;font-size:var(--text-xs);font-weight:700;flex-shrink:0;">
          ${i + 1}
        </div>
        <div>
          <div style="font-weight:600; font-size:var(--text-sm);">${task.text}</div>
          ${task.subTasks.length > 0 ? `
            <div style="margin-top:4px;">
              ${task.subTasks.map(st => `
                <div style="font-size:var(--text-xs);color:var(--text-tertiary);padding:1px 0;">· ${st}</div>
              `).join('')}
            </div>
          ` : ''}
          ${task.timeEstimate ? `<div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:2px;">⏱️ ${task.timeEstimate} min</div>` : ''}
        </div>
      </div>
    `).join('')}
    
    <button class="btn ${alreadyAdded ? 'btn-secondary' : 'btn-primary'} btn-block mt-lg" id="add-template-btn"
            ${alreadyAdded ? 'disabled style="opacity:0.6;"' : ''}>
      ${alreadyAdded ? '✅ Already Added' : 'Add to My Routines'}
    </button>
  `;
  
  showModal('', html);
  
  setTimeout(() => {
    document.getElementById('add-template-btn')?.addEventListener('click', () => {
      if (alreadyAdded) return;
      
      const newRoutine = {
        id: generateId(),
        name: template.name,
        timeOfDay: template.timeOfDay,
        tasks: template.tasks.map(t => ({
          id: generateId(),
          text: t.text,
          subTasks: [...t.subTasks],
          completed: false,
          timeEstimate: t.timeEstimate || null,
        })),
        order: existingRoutines.length,
        createdAt: new Date().toISOString(),
      };
      
      addRoutine(newRoutine);
      closeModal();
      showToast(`"${template.name}" added! Check Today tab 🎯`, 'success');
      
      // Navigate to Today
      setTimeout(() => navigate('today'), 500);
    });
  }, 100);
}

export function initDiscover() {
  const page = document.getElementById('discover-page');
  if (!page) return;
  
  page.addEventListener('click', (e) => {
    // Template click
    const templateCard = e.target.closest('[data-template-id]');
    if (templateCard) {
      showTemplateDetail(templateCard.dataset.templateId);
      return;
    }
    
    // Tip category filter
    const tipCat = e.target.closest('[data-tip-cat]');
    if (tipCat) {
      activeCategory = tipCat.dataset.tipCat;
      
      // Update active states
      page.querySelectorAll('[data-tip-cat]').forEach(el => {
        el.classList.toggle('active', el.dataset.tipCat === activeCategory);
      });
      
      // Re-render tips
      document.getElementById('tips-grid').innerHTML = renderTips();
      return;
    }
  });
}
