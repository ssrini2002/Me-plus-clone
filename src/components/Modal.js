// ============================================
// Me+ Clone — Modal Component
// ============================================

let activeModal = null;

export function showModal(title, contentHtml, options = {}) {
  closeModal();
  
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal-content" id="modal-content">
      <div class="modal-handle"></div>
      ${title ? `<div class="modal-title">${title}</div>` : ''}
      <div class="modal-body">${contentHtml}</div>
    </div>
  `;
  
  document.body.appendChild(backdrop);
  activeModal = backdrop;
  
  // Trigger animation
  requestAnimationFrame(() => {
    backdrop.classList.add('active');
  });
  
  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeModal();
      if (options.onClose) options.onClose();
    }
  });
  
  // Close on Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      if (options.onClose) options.onClose();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
  
  return backdrop;
}

export function closeModal() {
  if (!activeModal) return;
  
  activeModal.classList.remove('active');
  const modal = activeModal;
  setTimeout(() => {
    modal.remove();
  }, 400);
  activeModal = null;
}

export function getModalBody() {
  return document.querySelector('#modal-content .modal-body');
}
