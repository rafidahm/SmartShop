/**
 * banner.js — Hero promotional slider (4 slides, auto + manual)
 */

const SLIDES = [
  { image: './promo_img/image-resize.avif', href: '#products' },
  { image: './promo_img/image-resize (1).avif', href: '#products' },
  { image: './promo_img/image-resize (2).avif', href: '#products' },
  { image: './promo_img/image-resize (3).avif', href: '#products' },
  { image: './promo_img/image-resize (4).avif', href: '#products' },
  { image: './promo_img/image-resize (5).avif', href: '#products' },
  { image: './promo_img/image-resize (6).avif', href: '#products' },
];


let current  = 0;
let autoTimer = null;

function getTrack()  { return document.getElementById('banner-track'); }
function getDots()   { return document.getElementById('banner-dots'); }

function buildSlides() {
  const track = getTrack();
  if (!track) return;

  // Clear any forced width to rely on flexbox
  track.style.width = '100%';
  track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

  track.innerHTML = SLIDES.map((s, i) => `
    <div class="banner-slide" style="flex: 0 0 100%; min-width: 100%; position: relative;">
      <a href="${s.href}" class="block w-full">
        <img src="${s.image}" alt="Promo Banner" class="w-full h-auto block" />
      </a>
    </div>
  `).join('');

  buildDots();
}

function buildDots() {
  const dots = getDots();
  if (!dots) return;
  dots.innerHTML = SLIDES.map((_, i) => `
    <button data-idx="${i}" aria-label="Slide ${i+1}"
      class="dot w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === 0 ? 'bg-white scale-125' : 'bg-white/40'} shadow-sm">
    </button>
  `).join('');
  dots.querySelectorAll('.dot').forEach(btn => {
    btn.addEventListener('click', () => goTo(parseInt(btn.dataset.idx)));
  });
}

function updateDots() {
  getDots()?.querySelectorAll('.dot').forEach((btn, i) => {
    btn.className = `dot w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white scale-125' : 'bg-white/40'} shadow-sm`;
  });
}

export function goTo(idx) {
  current = (idx + SLIDES.length) % SLIDES.length;
  const track = getTrack();
  if (track) {
    track.style.transform = `translateX(-${current * 100}%)`;
  }
  updateDots();
}

export function next() { goTo(current + 1); }
export function prev() { goTo(current - 1); }

function startAuto() {
  stopAuto();
  autoTimer = setInterval(next, 4500);
}

function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
}

export function init() {
  buildSlides();

  document.getElementById('banner-prev')?.addEventListener('click', () => { prev(); startAuto(); });
  document.getElementById('banner-next')?.addEventListener('click', () => { next(); startAuto(); });

  const wrap = document.getElementById('banner-wrapper');
  wrap?.addEventListener('mouseenter', stopAuto);
  wrap?.addEventListener('mouseleave', startAuto);

  startAuto();
}
