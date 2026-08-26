// ============================================
// Me+ Clone — Onboarding Page
// ============================================

import { setUser } from '../store.js';
import { generateId } from '../utils.js';
import { addRoutine } from '../store.js';
import { navigate } from '../router.js';

const steps = [
  {
    emoji: '✨',
    title: 'Welcome to Me+',
    subtitle: 'Your personal companion for building a better you. Let\'s set up your experience in just a few steps.',
    type: 'welcome',
  },
  {
    emoji: '🎯',
    title: 'What would you like to improve?',
    subtitle: 'Select all areas that matter to you. We\'ll tailor your experience accordingly.',
    type: 'multi-select',
    options: [
      { id: 'sleep', emoji: '😴', label: 'Sleep' },
      { id: 'fitness', emoji: '💪', label: 'Fitness' },
      { id: 'productivity', emoji: '🎯', label: 'Productivity' },
      { id: 'mental', emoji: '🧠', label: 'Mental Health' },
      { id: 'nutrition', emoji: '🥗', label: 'Nutrition' },
      { id: 'mindfulness', emoji: '🧘', label: 'Mindfulness' },
    ],
  },
  {
    emoji: '🚧',
    title: 'What\'s your biggest challenge?',
    subtitle: 'Understanding your main hurdle helps us support you better.',
    type: 'single-select',
    options: [
      { id: 'consistency', emoji: '📅', label: 'Staying consistent' },
      { id: 'motivation', emoji: '🔥', label: 'Finding motivation' },
      { id: 'time', emoji: '⏰', label: 'Managing time' },
      { id: 'overwhelm', emoji: '😰', label: 'Feeling overwhelmed' },
      { id: 'starting', emoji: '🚀', label: 'Just getting started' },
    ],
  },
  {
    emoji: '📝',
    title: 'Make it personal',
    subtitle: 'Your commitment to yourself. This is the first step of your journey.',
    type: 'commitment',
  },
];

let currentStep = 0;
let selections = {
  areas: [],
  challenge: '',
  name: '',
  goal: '',
  morningTime: '07:00',
};

export function renderOnboarding() {
  currentStep = 0;
  selections = { areas: [], challenge: '', name: '', goal: '', morningTime: '07:00' };
  
  return `<div class="onboarding-page" id="onboarding-page">${renderStep()}</div>`;
}

function renderStep() {
  const step = steps[currentStep];
  const progressDots = steps.map((_, i) => {
    let cls = 'onboarding-progress-dot';
    if (i < currentStep) cls += ' completed';
    if (i === currentStep) cls += ' active';
    return `<div class="${cls}"></div>`;
  }).join('');
  
  let content = '';
  
  switch (step.type) {
    case 'welcome':
      content = renderWelcome(step);
      break;
    case 'multi-select':
      content = renderMultiSelect(step);
      break;
    case 'single-select':
      content = renderSingleSelect(step);
      break;
    case 'commitment':
      content = renderCommitment(step);
      break;
  }
  
  return `
    <div class="onboarding-progress">${progressDots}</div>
    ${content}
  `;
}

function renderWelcome(step) {
  return `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
      <div class="onboarding-hero-emoji">${step.emoji}</div>
      <h1 class="onboarding-title">${step.title}</h1>
      <p class="onboarding-subtitle">${step.subtitle}</p>
      
      <div style="text-align:center; margin-top:var(--space-xl);">
        <div style="display:inline-flex; gap:var(--space-sm); flex-wrap:wrap; justify-content:center;">
          ${['🧘 Routines', '📊 Tracking', '😊 Mood', '📖 Journal', '💡 Insights'].map(f => 
            `<span class="chip chip-sm" style="pointer-events:none;">${f}</span>`
          ).join('')}
        </div>
      </div>
    </div>
    <div class="onboarding-footer">
      <button class="btn btn-primary btn-lg btn-block" id="onboarding-next">
        Let's Begin ✨
      </button>
    </div>
  `;
}

function renderMultiSelect(step) {
  return `
    <div style="flex:1;">
      <div class="onboarding-hero-emoji">${step.emoji}</div>
      <h1 class="onboarding-title">${step.title}</h1>
      <p class="onboarding-subtitle">${step.subtitle}</p>
      
      <div class="onboarding-options" id="onboarding-options">
        ${step.options.map(opt => `
          <div class="onboarding-option ${selections.areas.includes(opt.id) ? 'selected' : ''}" 
               data-id="${opt.id}">
            <span class="onboarding-option-emoji">${opt.emoji}</span>
            <span class="onboarding-option-text">${opt.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="onboarding-footer">
      <button class="btn btn-primary btn-lg btn-block" id="onboarding-next" 
              ${selections.areas.length === 0 ? 'style="opacity:0.5; pointer-events:none;"' : ''}>
        Continue
      </button>
      <button class="btn btn-ghost btn-block" id="onboarding-back">Back</button>
    </div>
  `;
}

function renderSingleSelect(step) {
  return `
    <div style="flex:1;">
      <div class="onboarding-hero-emoji">${step.emoji}</div>
      <h1 class="onboarding-title">${step.title}</h1>
      <p class="onboarding-subtitle">${step.subtitle}</p>
      
      <div class="onboarding-options" id="onboarding-options" style="flex-direction:column; align-items:stretch;">
        ${step.options.map(opt => `
          <div class="onboarding-option ${selections.challenge === opt.id ? 'selected' : ''}" 
               data-id="${opt.id}"
               style="flex-direction:row; max-width:100%; gap:var(--space-md);">
            <span class="onboarding-option-emoji">${opt.emoji}</span>
            <span class="onboarding-option-text" style="text-align:left;">${opt.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="onboarding-footer">
      <button class="btn btn-primary btn-lg btn-block" id="onboarding-next"
              ${!selections.challenge ? 'style="opacity:0.5; pointer-events:none;"' : ''}>
        Continue
      </button>
      <button class="btn btn-ghost btn-block" id="onboarding-back">Back</button>
    </div>
  `;
}

function renderCommitment(step) {
  return `
    <div style="flex:1;">
      <div class="onboarding-hero-emoji">${step.emoji}</div>
      <h1 class="onboarding-title">${step.title}</h1>
      <p class="onboarding-subtitle">${step.subtitle}</p>
      
      <div class="card" style="background: var(--gradient-card); border: 2px solid var(--border-medium); padding: var(--space-xl);">
        <div style="text-align:center; font-size:var(--text-sm); color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:var(--space-xl);">
          My Commitment Contract
        </div>
        
        <div class="input-group mb-lg">
          <label class="input-label">Your Name</label>
          <input type="text" class="input" id="onboarding-name" placeholder="What should we call you?" 
                 value="${selections.name}" autocomplete="off">
        </div>
        
        <div class="input-group mb-lg">
          <label class="input-label">Your Goal</label>
          <textarea class="input textarea" id="onboarding-goal" placeholder="I want to become someone who..." 
                    style="min-height:80px;">${selections.goal}</textarea>
        </div>
        
        <div class="input-group">
          <label class="input-label">Morning Start Time</label>
          <input type="time" class="input" id="onboarding-time" value="${selections.morningTime}">
        </div>
      </div>
    </div>
    <div class="onboarding-footer">
      <button class="btn btn-primary btn-lg btn-block" id="onboarding-finish">
        Start My Journey 🚀
      </button>
      <button class="btn btn-ghost btn-block" id="onboarding-back">Back</button>
    </div>
  `;
}

function createStarterRoutine(areas) {
  const tasks = [];
  
  // Always include basics
  tasks.push({ id: generateId(), text: 'Make your bed', subTasks: [], completed: false, timeEstimate: 2 });
  tasks.push({ id: generateId(), text: 'Drink a glass of water', subTasks: [], completed: false, timeEstimate: 1 });
  
  if (areas.includes('fitness') || areas.includes('sleep')) {
    tasks.push({ id: generateId(), text: 'Morning stretch (5 min)', subTasks: ['Neck rolls', 'Shoulder stretch', 'Touch toes'], completed: false, timeEstimate: 5 });
  }
  
  if (areas.includes('mindfulness') || areas.includes('mental')) {
    tasks.push({ id: generateId(), text: 'Mindful breathing (3 min)', subTasks: [], completed: false, timeEstimate: 3 });
  }
  
  if (areas.includes('nutrition')) {
    tasks.push({ id: generateId(), text: 'Prepare a healthy breakfast', subTasks: [], completed: false, timeEstimate: 15 });
  }
  
  if (areas.includes('productivity')) {
    tasks.push({ id: generateId(), text: 'Plan your top 3 priorities', subTasks: [], completed: false, timeEstimate: 5 });
  }
  
  tasks.push({ id: generateId(), text: 'Review your goals', subTasks: [], completed: false, timeEstimate: 3 });
  
  return {
    id: generateId(),
    name: 'My Morning Routine',
    timeOfDay: 'morning',
    tasks,
    order: 0,
    createdAt: new Date().toISOString(),
  };
}

export function initOnboarding() {
  const page = document.getElementById('onboarding-page');
  if (!page) return;
  
  page.addEventListener('click', (e) => {
    const option = e.target.closest('.onboarding-option');
    const nextBtn = e.target.closest('#onboarding-next');
    const backBtn = e.target.closest('#onboarding-back');
    const finishBtn = e.target.closest('#onboarding-finish');
    
    if (option) {
      const id = option.dataset.id;
      
      if (currentStep === 1) {
        // Multi-select
        const idx = selections.areas.indexOf(id);
        if (idx !== -1) {
          selections.areas.splice(idx, 1);
        } else {
          selections.areas.push(id);
        }
      } else if (currentStep === 2) {
        // Single-select
        selections.challenge = id;
      }
      
      page.innerHTML = renderStep();
    }
    
    if (nextBtn && !nextBtn.style.pointerEvents?.includes('none')) {
      if (currentStep < steps.length - 1) {
        currentStep++;
        page.innerHTML = renderStep();
      }
    }
    
    if (backBtn) {
      if (currentStep > 0) {
        currentStep--;
        page.innerHTML = renderStep();
      }
    }
    
    if (finishBtn) {
      const nameInput = document.getElementById('onboarding-name');
      const goalInput = document.getElementById('onboarding-goal');
      const timeInput = document.getElementById('onboarding-time');
      
      selections.name = nameInput?.value?.trim() || 'Friend';
      selections.goal = goalInput?.value?.trim() || '';
      selections.morningTime = timeInput?.value || '07:00';
      
      // Save user profile
      setUser({
        name: selections.name,
        goal: selections.goal,
        areas: selections.areas,
        challenge: selections.challenge,
        morningTime: selections.morningTime,
        createdAt: new Date().toISOString(),
        theme: 'light',
        onboardingComplete: true,
      });
      
      // Create starter routine
      const routine = createStarterRoutine(selections.areas);
      addRoutine(routine);
      
      // Navigate to main app
      navigate('today');
      // Force full re-render
      window.dispatchEvent(new Event('app-init'));
    }
  });
  
  // Handle input changes for commitment step
  page.addEventListener('input', (e) => {
    if (e.target.id === 'onboarding-name') selections.name = e.target.value;
    if (e.target.id === 'onboarding-goal') selections.goal = e.target.value;
    if (e.target.id === 'onboarding-time') selections.morningTime = e.target.value;
  });
}
