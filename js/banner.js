/**
 * banner.js — Hero promotional slider (4 slides, auto + manual)
 */

const SLIDES = [
  {
    image:    './promo_img/promo1.jpg',
    badge:    'New Arrivals',
    title:    'Shop Smart,\nLive Better',
    subtitle: 'Discover thousands of products at unbeatable prices. Quality you can trust.',
    cta:      'Shop Now',
    href:     '#products',
  },
  {
    image:    './promo_img/promo2.jpg',
    badge:    'Hot Deals',
    title:    'Exclusive\nOffers Today',
    subtitle: 'Limited-time discounts on top brands. Don\'t miss out on these incredible deals!',
    cta:      'Grab Deals',
    href:     '#products',
  },
  {
    image:    './promo_img/promo3.jpg',
    badge:    'Electronics',
    title:    'Tech That\nInspires You',
    subtitle: 'Explore the latest gadgets, wearables, and smart devices for every lifestyle.',
    cta:      'Explore Tech',
    href:     '#products',
  },
  {
    image:    './promo_img/promo4.jpg',
    badge:    'Fashion Week',
    title:    'Style Meets\nAffordability',
    subtitle: 'Trendy clothing, jewelry, and accessories for men and women at amazing prices.',
    cta:      'Shop Fashion',
    href:     '#products',
  },
];


let current  = 0;
let autoTimer = null;

function getTrack()  { return document.getElementById('banner-track'); }
function getDots()   { return document.getElementById('banner-dots'); }

function buildSlides() {
  const track = getTrack();
  if (!track) return;

  track.innerHTML = SLIDES.map((s, i) => `
    <div class="banner-slide" style="background: url('${s.image}') center/cover no-repeat; position:relative; overflow:hidden; padding: 2rem 4rem;">
      <!-- Dark overlay for text readability -->
      <div style="position:absolute; inset:0; background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%);"></div>
      
      <div style="position:relative;z-index:10;max-width:36rem;height:100%;display:flex;flex-direction:column;justify-content:center;">
        <div>
          <span style="display:inline-block;background:rgba(20,184,166,0.9);color:#fff;font-size:0.75rem;font-weight:700;padding:4px 12px;border-radius:99px;margin-bottom:1rem;backdrop-filter:blur(4px);">${s.badge}</span>
        </div>
        <h2 style="font-size:clamp(1.75rem,4vw,3rem);font-weight:900;color:#fff;line-height:1.15;margin-bottom:0.75rem;text-shadow:0 2px 4px rgba(0,0,0,0.3);">${s.title.replace('\n','<br>')}</h2>
        <p style="color:rgba(255,255,255,0.9);font-size:clamp(0.85rem,1.5vw,1rem);margin-bottom:1.5rem;max-width:28rem;text-shadow:0 1px 2px rgba(0,0,0,0.5);">${s.subtitle}</p>
        <div>
          <a href="${s.href}" style="display:inline-flex;align-items:center;gap:8px;background:#14b8a6;color:#fff;font-weight:700;padding:12px 24px;border-radius:99px;text-decoration:none;font-size:0.875rem;box-shadow:0 4px 14px rgba(20,184,166,0.4);transition:transform 0.2s, background 0.2s;" onmouseover="this.style.transform='scale(1.05)'; this.style.background='#0d9488';" onmouseout="this.style.transform='scale(1)'; this.style.background='#14b8a6';">
            ${s.cta}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
      </div>
    </div>
  `).join('');


  buildDots();
}

function buildDots() {
  const dots = getDots();
  if (!dots) return;
  dots.innerHTML = SLIDES.map((_, i) => `
    <button data-idx="${i}" aria-label="Slide ${i+1}"
      class="dot w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === 0 ? 'bg-white scale-125' : 'bg-white/40'}">
    </button>
  `).join('');
  dots.querySelectorAll('.dot').forEach(btn => {
    btn.addEventListener('click', () => goTo(parseInt(btn.dataset.idx)));
  });
}

function updateDots() {
  getDots()?.querySelectorAll('.dot').forEach((btn, i) => {
    btn.className = `dot w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white scale-125' : 'bg-white/40'}`;
  });
}

export function goTo(idx) {
  current = (idx + SLIDES.length) % SLIDES.length;
  const track = getTrack();
  if (track) track.style.transform = `translateX(-${current * 100}%)`;
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
