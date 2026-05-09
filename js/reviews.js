/**
 * reviews.js — Customer review carousel from local JSON
 */

import { fetchReviews } from './api.js';

let reviews    = [];
let current    = 0;
let perView    = 3;
let autoTimer  = null;

function calcPerView() {
  if (window.innerWidth < 640)  return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

function avatarColor(name) {
  const colors = [
    'bg-teal-500','bg-orange-500','bg-purple-500','bg-pink-500',
    'bg-lime-500','bg-blue-500','bg-red-500','bg-indigo-500',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return colors[h % colors.length];
}

function starsHTML(rating) {
  return Array.from({ length: 5 }).map((_, i) =>
    `<svg class="w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-200'} fill-current" viewBox="0 0 20 20">
      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
    </svg>`
  ).join('');
}

function cardHTML(r) {
  const initials = r.reviewer.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const date     = new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return `
    <div class="bg-white rounded-2xl p-6 shadow-md flex flex-col gap-3 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-full ${avatarColor(r.reviewer)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0">${initials}</div>
        <div>
          <p class="font-semibold text-gray-800 text-sm">${r.reviewer}</p>
          <p class="text-xs text-gray-400">${date}</p>
        </div>
        <div class="ml-auto flex gap-0.5">${starsHTML(r.rating)}</div>
      </div>
      <p class="text-sm text-gray-600 leading-relaxed">"${r.comment}"</p>
      <div class="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50">
        <span class="text-xs text-gray-400">Product #${r.productId}</span>
        <span class="ml-auto text-xs font-semibold text-primary">Verified Buyer ✓</span>
      </div>
    </div>
  `;
}

function render() {
  const track = document.getElementById('reviews-track');
  if (!track || reviews.length === 0) return;

  perView = calcPerView();
  const maxStart = Math.max(0, reviews.length - perView);
  if (current > maxStart) current = maxStart;

  track.innerHTML = reviews.map(cardHTML).join('');

  const cards    = track.querySelectorAll(':scope > div');
  const pct      = 100 / perView;
  cards.forEach(c => {
    c.style.minWidth = `${pct}%`;
    c.style.maxWidth = `${pct}%`;
  });
  track.style.transform = `translateX(-${current * pct}%)`;

  buildDots();
}

function buildDots() {
  const dots = document.getElementById('reviews-dots');
  if (!dots) return;
  const total = Math.max(1, reviews.length - perView + 1);
  dots.innerHTML = Array.from({ length: total }).map((_, i) =>
    `<button data-idx="${i}" class="review-dot w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-primary w-5' : 'bg-gray-300'}"></button>`
  ).join('');
  dots.querySelectorAll('.review-dot').forEach(btn =>
    btn.addEventListener('click', () => goTo(parseInt(btn.dataset.idx))));
}

function goTo(idx) {
  const maxStart = Math.max(0, reviews.length - perView);
  current = Math.max(0, Math.min(idx, maxStart));
  const track = document.getElementById('reviews-track');
  const pct   = 100 / perView;
  if (track) track.style.transform = `translateX(-${current * pct}%)`;
  buildDots();
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

function startAuto() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = setInterval(() => {
    const maxStart = Math.max(0, reviews.length - perView);
    goTo(current >= maxStart ? 0 : current + 1);
  }, 5000);
}

export async function init() {
  try {
    reviews = await fetchReviews();
    render();

    document.getElementById('reviews-prev')?.addEventListener('click', () => { prev(); startAuto(); });
    document.getElementById('reviews-next')?.addEventListener('click', () => { next(); startAuto(); });

    const section = document.getElementById('reviews');
    section?.addEventListener('mouseenter', () => clearInterval(autoTimer));
    section?.addEventListener('mouseleave', startAuto);

    window.addEventListener('resize', () => render());
    startAuto();
  } catch (err) {
    console.error('Reviews load failed:', err);
  }
}
