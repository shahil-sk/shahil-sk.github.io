// tilt3d.js
// 3D card tilt engine + hero name mouse-parallax
// Runs after DOM is ready, watches dynamically added cards too

(function () {
  'use strict';

  // how many degrees to tilt at the edge of a card
  const MAX_TILT   = 12;
  // how far hero name rotates following the mouse (degrees)
  const HERO_TILT  = 6;

  // smooth lerp factor per frame
  const LERP = 0.12;

  // track per-card state so we can lerp smoothly
  const cardState = new WeakMap();

  // cards that should get tilt behaviour
  const CARD_SELECTOR = [
    '.project-card',
    '.skill-category',
    '.blog-card',
    '.contact-card',
    '.info-card',
    '.cert-page-card',
  ].join(',');

  function attachTilt(card) {
    if (cardState.has(card)) return; // already attached

    const state = { rx: 0, ry: 0, txTarget: 0, tyTarget: 0, raf: null, active: false };
    cardState.set(card, state);

    card.addEventListener('mouseenter', () => {
      state.active = true;
      if (!state.raf) loop(card, state);
    });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const nx   = (e.clientX - rect.left)  / rect.width  - 0.5; // -0.5 to 0.5
      const ny   = (e.clientY - rect.top)   / rect.height - 0.5;
      state.txTarget = ny * -MAX_TILT;  // rotate X around horizontal axis
      state.tyTarget = nx *  MAX_TILT;  // rotate Y around vertical axis
    });

    card.addEventListener('mouseleave', () => {
      state.active    = false;
      state.txTarget  = 0;
      state.tyTarget  = 0;
      // keep looping until settled
    });
  }

  function loop(card, state) {
    state.rx += (state.txTarget - state.rx) * LERP;
    state.ry += (state.tyTarget - state.ry) * LERP;

    card.style.setProperty('--rx', state.rx.toFixed(3) + 'deg');
    card.style.setProperty('--ry', state.ry.toFixed(3) + 'deg');

    const settled = Math.abs(state.rx) < 0.05 && Math.abs(state.ry) < 0.05 && !state.active;

    if (settled) {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      state.raf = null;
    } else {
      state.raf = requestAnimationFrame(() => loop(card, state));
    }
  }

  // attach to all current cards
  function scanCards() {
    document.querySelectorAll(CARD_SELECTOR).forEach(attachTilt);
  }

  // watch for dynamic card injection (script.js builds them after data.json load)
  const observer = new MutationObserver(scanCards);
  observer.observe(document.body, { childList: true, subtree: true });

  // initial scan
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanCards);
  } else {
    scanCards();
  }

  // ============================================
  // HERO NAME 3D PARALLAX
  // Mouse position tilts the whole hero-name block
  // ============================================

  let heroRx = 0, heroRy = 0, heroTxT = 0, heroTyT = 0;

  function initHeroParallax() {
    const heroName = document.querySelector('.hero-name');
    if (!heroName) return;

    window.addEventListener('mousemove', e => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;  // -1 to 1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      heroTxT = ny * -HERO_TILT;
      heroTyT = nx *  HERO_TILT;
    }, { passive: true });

    (function heroLoop() {
      heroRx += (heroTxT - heroRx) * 0.06;
      heroRy += (heroTyT - heroRy) * 0.06;
      heroName.style.transform =
        `perspective(1000px) rotateX(${heroRx.toFixed(3)}deg) rotateY(${heroRy.toFixed(3)}deg)`;
      requestAnimationFrame(heroLoop);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroParallax);
  } else {
    initHeroParallax();
  }

})();
