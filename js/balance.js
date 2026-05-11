/**
 * balance.js — User balance system
 * Default: 1000 BDT | Persisted via localStorage
 */

const BALANCE_KEY     = 'smartshop_balance';
const DEFAULT_BALANCE = 1000;

/* ── Core ─────────────────────────────────────────────── */
export function getBalance() {
  const v = localStorage.getItem(BALANCE_KEY);
  return v !== null ? parseFloat(v) : DEFAULT_BALANCE;
}

export function saveBalance(amount) {
  localStorage.setItem(BALANCE_KEY, amount.toString());
}

export function addBalance(amount) {
  const newBal = getBalance() + amount;
  saveBalance(newBal);
  renderBalance();
  return newBal;
}

export function deductBalance(amount) {
  const cur = getBalance();
  if (amount > cur) throw new Error('Insufficient balance.');
  const newBal = cur - amount;
  saveBalance(newBal);
  renderBalance();
  return newBal;
}

export function canAfford(amount) { return getBalance() >= amount; }

/* ── UI ───────────────────────────────────────────────── */
export function renderBalance() {
  const bal = getBalance().toFixed(2);
  document.querySelectorAll('.balance-display').forEach(el => {
    el.textContent = `$${bal}`;
  });
}

function openModal() {
  renderBalance();
  const modal = document.getElementById('balance-modal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function closeModal() {
  const modal = document.getElementById('balance-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
  const inp = document.getElementById('add-amount-input');
  const err = document.getElementById('balance-error');
  if (inp) inp.value = '';
  if (err) { err.textContent = ''; err.className = 'text-sm mt-1 h-4'; }
  // Reset payment method selection
  document.querySelectorAll('input[name="payment-method"]').forEach(r => r.checked = false);
}

function handleAddMoney() {
  const inp    = document.getElementById('add-amount-input');
  const errEl  = document.getElementById('balance-error');
  const method = document.querySelector('input[name="payment-method"]:checked');
  const amount = parseFloat(inp?.value?.replace(/[^0-9.]/g, ''));

  if (!method) {
    errEl.textContent = 'Please select a payment method.';
    errEl.className   = 'text-sm mt-1 h-4 text-red-500';
    return;
  }

  if (!inp?.value || isNaN(amount) || amount <= 0) {
    errEl.textContent = 'Please enter a valid positive amount.';
    errEl.className   = 'text-sm mt-1 h-4 text-red-500';
    return;
  }

  addBalance(amount);
  errEl.textContent = `✓ $${amount.toFixed(2)} added via ${method.value === 'bkash' ? 'bKash' : 'Visa'}!`;
  errEl.className   = 'text-sm mt-1 h-4 text-primary';
  inp.value = '';
  window.showToast(`$${amount.toFixed(2)} added via ${method.value === 'bkash' ? 'bKash' : 'Visa'}!`, 'success');
  setTimeout(() => { errEl.textContent = ''; }, 3000);
}

/* ── Init ─────────────────────────────────────────────── */
export function init() {
  if (localStorage.getItem(BALANCE_KEY) === null) saveBalance(DEFAULT_BALANCE);
  renderBalance();

  document.querySelectorAll('.balance-btn').forEach(btn =>
    btn.addEventListener('click', openModal));

  document.getElementById('balance-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('balance-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  const addBtn = document.getElementById('add-money-btn');
  const addInp = document.getElementById('add-amount-input');
  const errEl = document.getElementById('balance-error');

  addBtn?.addEventListener('click', handleAddMoney);
  addInp?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAddMoney();
  });

  // Real-time validation clear
  const validateClear = () => {
    if (errEl && errEl.textContent) {
      const method = document.querySelector('input[name="payment-method"]:checked');
      const amount = parseFloat(addInp?.value?.replace(/[^0-9.]/g, ''));
      if (method && amount > 0) {
        errEl.textContent = '';
      }
    }
  };

  addInp?.addEventListener('input', validateClear);
  document.querySelectorAll('input[name="payment-method"]').forEach(r => {
    r.addEventListener('change', () => {
      if (errEl && errEl.textContent === 'Please select a payment method.') {
        errEl.textContent = '';
      } else {
        validateClear();
      }
    });
  });
}
