/**
 * navbar.js — Sticky navbar: hamburger, active links, smooth scroll
 */

export function init() {
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger-btn');
  const mobileMenu  = document.getElementById('mobile-menu');
  const navLinks    = document.querySelectorAll('.nav-link');

  /* ── Hamburger toggle ─────────────────────────────── */
  hamburger?.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    if (isOpen) {
      mobileMenu.classList.add('hidden');
      mobileMenu.style.display = '';
    } else {
      mobileMenu.classList.remove('hidden');
      mobileMenu.style.display    = 'flex';
      mobileMenu.style.flexDirection = 'column';
    }
    // Animate hamburger → X
    const spans = hamburger.querySelectorAll('span');
    if (!isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  /* Close mobile menu when a link is clicked */
  mobileMenu?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('flex');
      hamburger?.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  /* ── Navbar shadow on scroll ──────────────────────── */
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('shadow-lg', window.scrollY > 20);
    }
  });

  /* ── Active link via IntersectionObserver ─────────── */
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
          const match = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('text-primary', match);
          link.classList.toggle('font-semibold', match);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
}
