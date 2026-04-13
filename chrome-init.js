/**
 * chrome-init.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight init: replaces Three.js + tilt3d + fx.js scroll-heavy logic
 *
 * Responsibilities:
 *   1. Scroll progress bar
 *   2. Scroll reveal (IntersectionObserver — no scroll listener)
 *   3. Mobile menu toggle
 *   4. Theme toggle (dark ↔ light)
 *   5. Typewriter tagline
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ── 1. Scroll progress ────────────────────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    // requestAnimationFrame-throttled scroll listener
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const max = document.documentElement.scrollHeight - window.innerHeight;
          progressBar.style.width = max > 0 ? (scrolled / max * 100) + '%' : '0%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── 2. Scroll reveal via IntersectionObserver ─────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Unobserve after reveal — no wasted callbacks
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately (reduced motion or no support)
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ── 3. Mobile menu ────────────────────────────────────────────────────── */
  const menuToggle  = document.getElementById('menu-toggle');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function closeMenu() {
    mobileMenu?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      // Prevent body scroll while menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close on link tap
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
    // Close on Escape
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ── 4. Theme toggle ───────────────────────────────────────────────────── */
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const html        = document.documentElement;

  // Read system preference as default; html already has data-theme="dark" from markup
  let currentTheme = html.getAttribute('data-theme') || 'dark';

  const MOON_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const SUN_SVG  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    currentTheme = theme;
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark' ? MOON_SVG : SUN_SVG;
      themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  applyTheme(currentTheme);

  /* ── 5. Typewriter tagline ─────────────────────────────────────────────── */
  const taglineEl = document.getElementById('tagline-text');
  if (taglineEl) {
    const phrases = [
      'Penetration Tester',
      'Red Team Operator',
      'Vulnerability Researcher',
      'CTF Player',
    ];
    let pi = 0, ci = 0, deleting = false;

    function type() {
      const phrase = phrases[pi];
      if (!deleting) {
        taglineEl.textContent = phrase.slice(0, ++ci);
        if (ci === phrase.length) {
          deleting = true;
          setTimeout(type, 1800);
          return;
        }
      } else {
        taglineEl.textContent = phrase.slice(0, --ci);
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
        }
      }
      setTimeout(type, deleting ? 40 : 75);
    }

    setTimeout(type, 600);
  }
})();
