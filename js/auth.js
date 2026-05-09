/**
 * auth.js — Frontend authentication using localStorage
 */

const USERS_KEY   = 'smartshop_users';
const SESSION_KEY = 'smartshop_session';

/* ── Storage helpers ─────────────────────────────────── */
function getUsers()       { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
function saveUsers(u)     { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
export function getSession()   { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
function saveSession(s)   { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
export function isLoggedIn()   { return getSession() !== null; }

/* ── Core actions ────────────────────────────────────── */
export function signup(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email === email)) throw new Error('Email already registered.');
  users.push({ name, email, password });
  saveUsers(users);
  saveSession({ name, email });
  updateNavAuthUI();
}

export function login(email, password) {
  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password.');
  saveSession({ name: user.name, email: user.email });
  updateNavAuthUI();
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  updateNavAuthUI();
}

/* ── Update navbar UI based on auth state ─────────────── */
export function updateNavAuthUI() {
  const session       = getSession();
  const loginBtn      = document.getElementById('nav-login-btn');
  const logoutBtn     = document.getElementById('nav-logout-btn');
  const userGreeting  = document.getElementById('nav-user-greeting');
  const mLoginBtn     = document.getElementById('mobile-login-btn');
  const mLogoutBtn    = document.getElementById('mobile-logout-btn');
  const mGreeting     = document.getElementById('mobile-user-greeting');

  if (session) {
    loginBtn  && (loginBtn.style.display  = 'none');
    logoutBtn && (logoutBtn.style.display = 'inline-flex');
    userGreeting && (userGreeting.textContent = `Hi, ${session.name}`, userGreeting.classList.remove('hidden'));
    mLoginBtn  && (mLoginBtn.style.display  = 'none');
    mLogoutBtn && (mLogoutBtn.style.display = 'inline-flex');
    mGreeting  && (mGreeting.textContent = `Hi, ${session.name}`, mGreeting.classList.remove('hidden'));
  } else {
    loginBtn  && (loginBtn.style.display  = 'inline-flex');
    logoutBtn && (logoutBtn.style.display = 'none');
    userGreeting && (userGreeting.classList.add('hidden'));
    mLoginBtn  && (mLoginBtn.style.display  = 'inline-flex');
    mLogoutBtn && (mLogoutBtn.style.display = 'none');
    mGreeting  && (mGreeting.classList.add('hidden'));
  }
}


/* ── Modal helpers ───────────────────────────────────── */
export function openAuthModal(tab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  switchAuthTab(tab);
}

export function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  clearAuthErrors();
}

function switchAuthTab(tab) {
  const loginPanel  = document.getElementById('login-panel');
  const signupPanel = document.getElementById('signup-panel');
  const loginTab    = document.getElementById('tab-login');
  const signupTab   = document.getElementById('tab-signup');
  if (tab === 'login') {
    loginPanel.classList.remove('hidden');  signupPanel.classList.add('hidden');
    loginTab.classList.add('border-b-2','border-primary','text-primary');
    signupTab.classList.remove('border-b-2','border-primary','text-primary');
  } else {
    signupPanel.classList.remove('hidden'); loginPanel.classList.add('hidden');
    signupTab.classList.add('border-b-2','border-primary','text-primary');
    loginTab.classList.remove('border-b-2','border-primary','text-primary');
  }
}

function clearAuthErrors() {
  ['login-error','signup-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

/* ── init ────────────────────────────────────────────── */
export function init() {
  updateNavAuthUI();

  /* Open modal buttons */
  document.getElementById('nav-login-btn')?.addEventListener('click', () => openAuthModal('login'));
  document.getElementById('mobile-login-btn')?.addEventListener('click', () => openAuthModal('login'));

  /* Logout buttons */
  document.getElementById('nav-logout-btn')?.addEventListener('click', () => { logout(); window.showToast('Logged out successfully.', 'info'); });
  document.getElementById('mobile-logout-btn')?.addEventListener('click', () => { logout(); window.showToast('Logged out successfully.', 'info'); });

  /* Modal close */
  document.getElementById('auth-modal-close')?.addEventListener('click', closeAuthModal);
  document.getElementById('auth-modal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeAuthModal(); });

  /* Tab switching */
  document.getElementById('tab-login')?.addEventListener('click',  () => switchAuthTab('login'));
  document.getElementById('tab-signup')?.addEventListener('click', () => switchAuthTab('signup'));

  /* Login form */
  document.getElementById('login-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');
    try {
      login(email, password);
      closeAuthModal();
      window.showToast(`Welcome back, ${getSession().name}!`, 'success');
    } catch (err) {
      errEl.textContent = err.message;
    }
  });

  /* Signup form */
  document.getElementById('signup-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const errEl    = document.getElementById('signup-error');
    if (!name)                              { errEl.textContent = 'Name is required.'; return; }
    if (!/\S+@\S+\.\S+/.test(email))       { errEl.textContent = 'Enter a valid email.'; return; }
    if (password.length < 6)               { errEl.textContent = 'Password must be at least 6 characters.'; return; }
    try {
      signup(name, email, password);
      closeAuthModal();
      window.showToast(`Account created! Welcome, ${name}!`, 'success');
    } catch (err) {
      errEl.textContent = err.message;
    }
  });
}
