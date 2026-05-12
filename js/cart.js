/**
 * cart.js — Shopping cart: add/remove/qty, coupon, calculations, sidebar UI
 */

import { isLoggedIn, openAuthModal } from './auth.js';
import { canAfford, deductBalance, renderBalance } from './balance.js';

const CART_KEY   = 'smartshop_cart';
const COUPON_KEY = 'smartshop_coupon';
const DELIVERY_FREE_THRESHOLD = 50;
const DELIVERY_FEE = 5.00;
const COUPONS = { 'SMART10': 0.10, 'BLACK50': 0.50 };

/* ── Storage ──────────────────────────────────────────── */
export function getCart()  { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(c)       { localStorage.setItem(CART_KEY, JSON.stringify(c)); }
function getCoupon()       { return JSON.parse(localStorage.getItem(COUPON_KEY) || 'null'); }
function saveCoupon(c)     { localStorage.setItem(COUPON_KEY, JSON.stringify(c)); }
export function getCount() { return getCart().reduce((s, i) => s + i.quantity, 0); }

/* ── Calculations ─────────────────────────────────────── */
export function calcTotals() {
  const cart     = getCart();
  const coupon   = getCoupon();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = subtotal >= DELIVERY_FREE_THRESHOLD ? 0 : DELIVERY_FEE;
  const discount = coupon ? subtotal * coupon.rate : 0;
  const total    = Math.max(0, subtotal + delivery - discount);
  return { subtotal, delivery, discount, total, coupon };
}

/* ── Core actions ─────────────────────────────────────── */
export function addItem(product) {
  if (!isLoggedIn()) {
    openAuthModal('login');
    window.showToast('Please login to add items to cart!', 'warning');
    return;
  }
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === product.id);
  // Build tentative cart to check new total
  const tentative = cart.map(i => ({ ...i }));
  if (idx > -1) {
    tentative[idx].quantity++;
  } else {
    tentative.push({ id: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 });
  }
  const tentativeSubtotal = tentative.reduce((s, i) => s + i.price * i.quantity, 0);
  const tentativeDelivery = tentativeSubtotal >= DELIVERY_FREE_THRESHOLD ? 0 : DELIVERY_FEE;
  // Check against raw total WITHOUT coupon — balance must cover the full price
  const tentativeTotal    = tentativeSubtotal + tentativeDelivery;
  if (!canAfford(tentativeTotal)) {
    window.showToast('⚠️ Cannot add item — cart total would exceed your available balance!', 'warning');
    return;
  }
  // Commit to real cart
  if (idx > -1) {
    cart[idx].quantity++;
  } else {
    cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  renderCartItems();
  window.showToast(`"${product.title.substring(0, 30)}..." added to cart!`, 'success');
}

export function removeItem(id) {
  saveCart(getCart().filter(i => i.id !== id));
  updateCartBadge();
  renderCartItems();
}

export function changeQty(id, delta) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  // When increasing qty, check balance before committing
  if (delta > 0) {
    const tentative = cart.map(i => ({ ...i }));
    tentative[idx].quantity += delta;
    const tentativeSubtotal = tentative.reduce((s, i) => s + i.price * i.quantity, 0);
    const tentativeDelivery = tentativeSubtotal >= DELIVERY_FREE_THRESHOLD ? 0 : DELIVERY_FEE;
    // Check against raw total WITHOUT coupon — balance must cover the full price
    const tentativeTotal    = tentativeSubtotal + tentativeDelivery;
    if (!canAfford(tentativeTotal)) {
      window.showToast('⚠️ Cannot increase quantity — cart total would exceed your available balance!', 'warning');
      return;
    }
  }
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  saveCart(cart);
  updateCartBadge();
  renderCartItems();
}

export function applyCoupon(code) {
  const msgEl = document.getElementById('coupon-message');
  const rate  = COUPONS[code.toUpperCase().trim()];
  if (rate !== undefined) {
    saveCoupon({ code: code.toUpperCase().trim(), rate });
    msgEl.textContent = '';
    document.getElementById('coupon-input').value = '';
  } else {
    saveCoupon(null);
    msgEl.textContent = '✗ Invalid coupon code.';
    msgEl.className   = 'text-xs text-red-500';
  }
  renderTotals();
}

/* ── UI: Badge ───────────────────────────────────────── */
export function updateCartBadge() {
  const count = getCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.classList.toggle('scale-0', count === 0);
    el.classList.toggle('scale-100', count > 0);
  });
}

/* ── UI: Sidebar ─────────────────────────────────────── */
export function openCart() {
  document.getElementById('cart-sidebar')?.classList.remove('translate-x-full');
  document.getElementById('cart-overlay')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

export function closeCart() {
  document.getElementById('cart-sidebar')?.classList.add('translate-x-full');
  document.getElementById('cart-overlay')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const list  = document.getElementById('cart-items-list');
  const empty = document.getElementById('cart-empty-msg');
  const foot  = document.getElementById('cart-footer');
  if (!list) return;

  const cart = getCart();
  if (cart.length === 0) {
    list.innerHTML  = '';
    empty?.classList.remove('hidden');
    foot?.classList.add('hidden');
    renderTotals();
    return;
  }
  empty?.classList.add('hidden');
  foot?.classList.remove('hidden');

  list.innerHTML = cart.map(item => `
    <div class="flex gap-3 py-3 border-b border-gray-100 last:border-0 items-start">
      <img src="${item.image}" alt="${item.title}" class="w-14 h-14 object-contain rounded-lg bg-gray-50 p-1 flex-shrink-0"/>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">${item.title}</p>
        <p class="text-sm font-bold text-primary mt-1">$${item.price.toFixed(2)}</p>
        <div class="flex items-center gap-2 mt-2">
          <button onclick="window.cartChangeQty(${item.id}, -1)" class="w-6 h-6 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-gray-600 flex items-center justify-center text-sm font-bold transition-colors">−</button>
          <span class="text-sm font-semibold w-5 text-center">${item.quantity}</span>
          <button onclick="window.cartChangeQty(${item.id}, 1)"  class="w-6 h-6 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-gray-600 flex items-center justify-center text-sm font-bold transition-colors">+</button>
          <span class="ml-auto text-xs text-gray-500">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>
      <button onclick="window.cartRemove(${item.id})" class="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  `).join('');
  renderTotals();
}

function renderTotals() {
  const { subtotal, delivery, discount, total, coupon } = calcTotals();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('cart-subtotal', `$${subtotal.toFixed(2)}`);
  set('cart-delivery',  delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`);
  set('cart-discount', discount > 0 ? `-$${discount.toFixed(2)}` : '$0.00');
  set('cart-total',    `$${total.toFixed(2)}`);

  const inputEl  = document.getElementById('coupon-input');
  const btnEl    = document.getElementById('coupon-apply-btn');
  const badge    = document.getElementById('applied-coupon-badge');
  const badgeTxt = document.getElementById('applied-coupon-text');
  const msgEl    = document.getElementById('coupon-message');

  if (coupon) {
    if (msgEl) msgEl.classList.add('hidden');
    if (badge) { badge.classList.remove('hidden'); badge.classList.add('flex'); }
    if (badgeTxt) badgeTxt.textContent = `${coupon.code} - You got ${coupon.rate * 100}% off`;
    if (inputEl) { inputEl.disabled = true; inputEl.classList.add('opacity-50'); }
    if (btnEl) { btnEl.disabled = true; btnEl.classList.add('opacity-50', 'cursor-not-allowed'); }
  } else {
    if (msgEl) { msgEl.classList.remove('hidden'); msgEl.textContent = ''; }
    if (badge) { badge.classList.add('hidden'); badge.classList.remove('flex'); }
    if (inputEl) { inputEl.disabled = false; inputEl.classList.remove('opacity-50'); inputEl.value = ''; }
    if (btnEl) { btnEl.disabled = false; btnEl.classList.remove('opacity-50', 'cursor-not-allowed'); }
  }
}

/* ── Checkout ─────────────────────────────────────────── */
function handleCheckout() {
  if (!isLoggedIn()) { openAuthModal('login'); return; }
  const { total } = calcTotals();
  if (total === 0) { window.showToast('Your cart is empty!', 'warning'); return; }
  deductBalance(total);
  renderBalance();
  saveCart([]);
  saveCoupon(null);
  updateCartBadge();
  renderCartItems();
  closeCart();
  const inp = document.getElementById('coupon-input');
  const msg = document.getElementById('coupon-message');
  if (inp) inp.value = '';
  if (msg) msg.textContent = '';
  window.showToast('🎉 Order placed successfully!', 'success');
}

/* ── Init ─────────────────────────────────────────────── */
export function init() {
  // Expose globals for inline onclick handlers
  window.cartRemove    = (id) => removeItem(id);
  window.cartChangeQty = (id, delta) => changeQty(id, delta);

  updateCartBadge();
  renderCartItems();

  document.querySelectorAll('.cart-open-btn').forEach(btn =>
    btn.addEventListener('click', openCart));

  document.getElementById('cart-close-btn')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  document.getElementById('coupon-apply-btn')?.addEventListener('click', () => {
    const code = document.getElementById('coupon-input')?.value || '';
    applyCoupon(code);
  });

  document.getElementById('coupon-remove-btn')?.addEventListener('click', () => {
    saveCoupon(null);
    renderTotals();
  });

  document.getElementById('checkout-btn')?.addEventListener('click', handleCheckout);
}
