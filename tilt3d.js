// tilt3d.js
// Card 3D tilt + hero name mouse parallax
// Uses direct style.transform writes — avoids CSS var() issues inside overflow:hidden parents

(function () {
  'use strict';

  var MAX_TILT  = 10;  // degrees at card edge
  var HERO_TILT = 5;   // degrees hero name tilts
  var LERP      = 0.1;

  var SELECTOR = [
    '.project-card',
    '.skill-category',
    '.blog-card',
    '.contact-card',
    '.info-card',
    '.cert-page-card'
  ].join(',');

  // per-card live state
  var states = new WeakMap();

  function attach(card) {
    if (states.has(card)) return;
    var s = { rx: 0, ry: 0, tx: 0, ty: 0, running: false };
    states.set(card, s);

    card.addEventListener('mousemove', function(e) {
      var r  = card.getBoundingClientRect();
      var nx = (e.clientX - r.left)  / r.width  - 0.5;
      var ny = (e.clientY - r.top)   / r.height - 0.5;
      s.tx = ny * -MAX_TILT;
      s.ty = nx *  MAX_TILT;
      if (!s.running) run(card, s);
    });

    card.addEventListener('mouseleave', function() {
      s.tx = 0; s.ty = 0;
      if (!s.running) run(card, s);
    });
  }

  function run(card, s) {
    s.running = true;
    s.rx += (s.tx - s.rx) * LERP;
    s.ry += (s.ty - s.ry) * LERP;

    // write directly to style.transform
    // perspective() MUST come first in the transform list
    card.style.transform =
      'perspective(900px)' +
      ' rotateX(' + s.rx.toFixed(3) + 'deg)' +
      ' rotateY(' + s.ry.toFixed(3) + 'deg)' +
      ' scale3d(1.015, 1.015, 1.015)';

    card.style.boxShadow =
      '0 20px 60px rgba(255,0,0,' + (0.06 + Math.abs(s.rx + s.ry) * 0.006).toFixed(3) + '),' +
      '0 4px 20px rgba(0,0,0,0.5)';

    var done = Math.abs(s.rx) < 0.04 && Math.abs(s.ry) < 0.04 && s.tx === 0 && s.ty === 0;
    if (done) {
      s.rx = 0; s.ry = 0;
      card.style.transform = '';
      card.style.boxShadow = '';
      s.running = false;
    } else {
      requestAnimationFrame(function() { run(card, s); });
    }
  }

  function scan() {
    document.querySelectorAll(SELECTOR).forEach(attach);
  }

  // watch for cards injected dynamically by script.js after data.json loads
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }

  // ---- hero name 3D mouse parallax ----
  var hrx = 0, hry = 0, htx = 0, hty = 0;

  function heroLoop() {
    var name = document.querySelector('.hero-name');
    if (!name) { requestAnimationFrame(heroLoop); return; }

    window.addEventListener('mousemove', function(e) {
      htx = ((e.clientY / window.innerHeight) - 0.5) * -HERO_TILT * 2;
      hty = ((e.clientX / window.innerWidth)  - 0.5) *  HERO_TILT * 2;
    }, { passive: true });

    (function frame() {
      hrx += (htx - hrx) * 0.055;
      hry += (hty - hry) * 0.055;
      name.style.transform =
        'perspective(1200px)' +
        ' rotateX(' + hrx.toFixed(3) + 'deg)' +
        ' rotateY(' + hry.toFixed(3) + 'deg)';
      requestAnimationFrame(frame);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', heroLoop);
  } else {
    heroLoop();
  }

})();
