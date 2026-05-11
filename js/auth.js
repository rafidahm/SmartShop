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
  const balanceBtns   = document.querySelectorAll('.balance-btn');

  // Desktop Profile Elements
  const navProfileMenu = document.getElementById('nav-profile-menu');
  const navUserName    = document.getElementById('nav-user-greeting');

  if (session) {
    if (loginBtn) loginBtn.style.display = 'none';
    
    if (navProfileMenu) navProfileMenu.classList.remove('hidden');
    if (navUserName) navUserName.textContent = session.name;

    balanceBtns.forEach(btn => btn.style.display = '');
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    
    if (navProfileMenu) navProfileMenu.classList.add('hidden');
    
    // Close dropdown on logout
    document.getElementById('nav-profile-dropdown')?.classList.add('hidden');

    balanceBtns.forEach(btn => btn.style.display = 'none');
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
  document.getElementById('mobile-login-btn')?.addEventListener('click', () => {
    openAuthModal('login');
    // Also close mobile menu if it's open (optional, assuming handled elsewhere)
  });

  /* Profile Dropdown Toggle */
  const navProfileBtn = document.getElementById('nav-profile-btn');
  const navProfileDropdown = document.getElementById('nav-profile-dropdown');
  
  navProfileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    navProfileDropdown?.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!navProfileBtn?.contains(e.target) && !navProfileDropdown?.contains(e.target)) {
      navProfileDropdown?.classList.add('hidden');
    }
  });

  /* Logout buttons */
  const handleLogoutClick = () => { 
    logout(); 
    window.showToast('Logged out successfully.', 'info'); 
  };
  document.getElementById('nav-logout-btn')?.addEventListener('click', handleLogoutClick);
  document.getElementById('mobile-logout-btn')?.addEventListener('click', handleLogoutClick);

  /* Modal close */
  document.getElementById('auth-modal-close')?.addEventListener('click', closeAuthModal);
  document.getElementById('auth-modal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeAuthModal(); });

  /* Tab switching */
  document.getElementById('tab-login')?.addEventListener('click',  () => switchAuthTab('login'));
  document.getElementById('tab-signup')?.addEventListener('click', () => switchAuthTab('signup'));

  /* Login form */
  const loginEmailInp = document.getElementById('login-email');
  const loginPassInp = document.getElementById('login-password');
  const loginErrEl = document.getElementById('login-error');

  [loginEmailInp, loginPassInp].forEach(inp => {
    inp?.addEventListener('input', () => {
      if (loginErrEl) loginErrEl.textContent = '';
    });
  });

  document.getElementById('login-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const email    = loginEmailInp.value.trim();
    const password = loginPassInp.value;
    try {
      login(email, password);
      closeAuthModal();
      window.showToast(`Welcome back, ${getSession().name}!`, 'success');
    } catch (err) {
      if (loginErrEl) loginErrEl.textContent = err.message;
    }
  });

  /* Signup form */
  const signupNameInp = document.getElementById('signup-name');
  const signupEmailInp = document.getElementById('signup-email');
  const signupPassInp = document.getElementById('signup-password');
  const signupErrEl = document.getElementById('signup-error');

  const validateSignup = () => {
    const name = signupNameInp?.value.trim();
    const email = signupEmailInp?.value.trim();
    const password = signupPassInp?.value;

    if (!name) return 'Name is required.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  [signupNameInp, signupEmailInp, signupPassInp].forEach(inp => {
    inp?.addEventListener('input', () => {
      if (signupErrEl && signupErrEl.textContent) {
        // Clear error if the specific error condition is met, or just clear it on type.
        // It's usually better UX to just clear it as they type or validate in real-time.
        const errorMsg = validateSignup();
        if (!errorMsg) signupErrEl.textContent = '';
      }
    });
  });

  document.getElementById('signup-form')?.addEventListener('submit', e => {
    e.preventDefault();
    
    const errorMsg = validateSignup();
    if (errorMsg) {
      if (signupErrEl) signupErrEl.textContent = errorMsg;
      return;
    }

    try {
      signup(signupNameInp.value.trim(), signupEmailInp.value.trim(), signupPassInp.value);
      closeAuthModal();
      window.showToast(`Account created! Welcome, ${signupNameInp.value.trim()}!`, 'success');
    } catch (err) {
      if (signupErrEl) signupErrEl.textContent = err.message;
    }
  });
}
