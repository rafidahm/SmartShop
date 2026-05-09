/**
 * ui.js — Back-to-top button, contact form, toast notifications
 */

/* ── Toast ────────────────────────────────────────────── */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colors = {
    success: 'bg-green-500',
    error:   'bg-red-500',
    warning: 'bg-yellow-500',
    info:    'bg-teal-500',
  };
  const icons = {
    success: '✓',
    error:   '✗',
    warning: '⚠',
    info:    'ℹ',
  };

  const toast = document.createElement('div');
  toast.className = `flex items-center gap-3 ${colors[type] || colors.info} text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg max-w-xs transform translate-x-full transition-transform duration-300`;
  toast.innerHTML = `
    <span class="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold flex-shrink-0">${icons[type]}</span>
    <span class="flex-1">${message}</span>
    <button class="flex-shrink-0 opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove('translate-x-full'));

  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ── Back-to-top ──────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('opacity-0',       window.scrollY < 300);
    btn.classList.toggle('pointer-events-none', window.scrollY < 300);
    btn.classList.toggle('opacity-100',     window.scrollY >= 300);
  });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Contact form ─────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('contact-name')?.value.trim();
    const email   = document.getElementById('contact-email')?.value.trim();
    const message = document.getElementById('contact-message')?.value.trim();
    const errEl   = document.getElementById('contact-error');
    const sucEl   = document.getElementById('contact-success');

    if (errEl) errEl.textContent = '';
    if (sucEl) sucEl.classList.add('hidden');

    if (!name)                       { if (errEl) errEl.textContent = 'Name is required.'; return; }
    if (!/\S+@\S+\.\S+/.test(email)) { if (errEl) errEl.textContent = 'Enter a valid email.'; return; }
    if (!message)                    { if (errEl) errEl.textContent = 'Message cannot be empty.'; return; }

    /* Simulate submission */
    if (sucEl) sucEl.classList.remove('hidden');
    form.reset();
    showToast('Message sent! We\'ll get back to you soon.', 'success');
    setTimeout(() => sucEl?.classList.add('hidden'), 5000);
  });
}

/* ── Init ─────────────────────────────────────────────── */
export function init() {
  window.showToast = showToast;   // expose globally
  initBackToTop();
  initContactForm();
}
