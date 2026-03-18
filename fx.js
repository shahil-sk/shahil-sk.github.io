// fx.js
// Extra 3D effects: magnetic cursor, 3D section reveals,
// floating depth orbs, parallax section layers, scroll warp grid

(function () {
  'use strict';

  // ============================================================
  // 1. MAGNETIC CURSOR
  // Interactive elements pull the cursor dot toward their centre
  // ============================================================
  (function magneticCursor() {
    var dot = document.getElementById('cursor');
    var ring = document.getElementById('cursor-follower');
    if (!dot || !ring) return;

    var MAGNET_SELECTOR = 'a, button, .project-card, .contact-card, .info-card, .blog-card, .nav-link';
    var STRENGTH = 0.28; // 0 = no pull, 1 = snaps to centre

    var dotX = 0, dotY = 0;
    var rawX = 0, rawY = 0;

    window.addEventListener('mousemove', function (e) {
      rawX = e.clientX;
      rawY = e.clientY;
    }, { passive: true });

    function findMagnet(x, y) {
      var els = document.querySelectorAll(MAGNET_SELECTOR);
      var best = null, bestDist = 60; // px radius
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var cx = r.left + r.width  / 2;
        var cy = r.top  + r.height / 2;
        var d  = Math.hypot(cx - x, cy - y);
        if (d < bestDist) { bestDist = d; best = { cx: cx, cy: cy }; }
      });
      return best;
    }

    (function loop() {
      var m = findMagnet(rawX, rawY);
      var tx = m ? rawX + (m.cx - rawX) * STRENGTH : rawX;
      var ty = m ? rawY + (m.cy - rawY) * STRENGTH : rawY;

      dotX += (tx - dotX) * 0.22;
      dotY += (ty - dotY) * 0.22;

      dot.style.left = dotX + 'px';
      dot.style.top  = dotY + 'px';

      requestAnimationFrame(loop);
    })();
  })();


  // ============================================================
  // 2. 3D SECTION REVEAL  (rotateX flip on scroll)
  // Sections enter with a perspective flip, not just a fade-up
  // ============================================================
  (function section3DReveal() {
    var sections = document.querySelectorAll('.section');

    // override the default reveal style for section-inner blocks
    sections.forEach(function (sec) {
      sec.style.perspective = '1200px';

      var inner = sec.querySelector('.section-inner');
      if (!inner) return;
      inner.style.transformOrigin = '50% 0%';
      inner.style.transition = 'transform 0.9s cubic-bezier(0.16,1,0.3,1), opacity 0.9s cubic-bezier(0.16,1,0.3,1)';
      inner.style.opacity  = '0';
      inner.style.transform = 'rotateX(18deg) translateY(48px)';

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            inner.style.opacity   = '1';
            inner.style.transform = 'rotateX(0deg) translateY(0)';
            io.unobserve(sec);
          }
        });
      }, { threshold: 0.08 });
      io.observe(sec);
    });
  })();


  // ============================================================
  // 3. FLOATING DEPTH ORBS
  // Large blurred orbs drifting in the background — gives a
  // tangible sense of Z depth between sections
  // ============================================================
  (function depthOrbs() {
    var orbs = [
      { x: '15%',  y: '20%',  size: 520, dur: 18, delay: 0   },
      { x: '75%',  y: '55%',  size: 400, dur: 22, delay: 4   },
      { x: '40%',  y: '80%',  size: 600, dur: 26, delay: 8   },
      { x: '88%',  y: '10%',  size: 300, dur: 20, delay: 2   },
      { x: '5%',   y: '65%',  size: 350, dur: 24, delay: 12  },
    ];

    var container = document.createElement('div');
    container.style.cssText = [
      'position:fixed', 'inset:0',
      'z-index:0', 'pointer-events:none',
      'overflow:hidden'
    ].join(';');
    document.body.insertBefore(container, document.body.children[1] || null);

    orbs.forEach(function (o) {
      var el = document.createElement('div');
      el.style.cssText = [
        'position:absolute',
        'left:'  + o.x,
        'top:'   + o.y,
        'width:' + o.size + 'px',
        'height:'+ o.size + 'px',
        'border-radius:50%',
        'background:radial-gradient(circle, rgba(255,0,0,0.055) 0%, transparent 70%)',
        'filter:blur(60px)',
        'transform:translate(-50%,-50%)',
        'animation:orb-drift ' + o.dur + 's ease-in-out ' + o.delay + 's infinite alternate',
        'will-change:transform'
      ].join(';');
      container.appendChild(el);
    });

    // keyframes injected once
    var style = document.createElement('style');
    style.textContent = [
      '@keyframes orb-drift {',
      '  0%   { transform: translate(-50%,-50%) scale(1.0) rotate(0deg); }',
      '  33%  { transform: translate(calc(-50% + 40px), calc(-50% - 30px)) scale(1.08) rotate(4deg); }',
      '  66%  { transform: translate(calc(-50% - 30px), calc(-50% + 45px)) scale(0.94) rotate(-3deg); }',
      '  100% { transform: translate(-50%,-50%) scale(1.04) rotate(1deg); }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  })();


  // ============================================================
  // 4. PARALLAX SECTION LAYERS
  // Each section translates at a slightly different rate on scroll,
  // creating real depth separation between them
  // ============================================================
  (function parallaxSections() {
    // depth factor: how many px to shift per 100px scroll
    var layers = [
      { id: 'about',    factor: -0.04 },
      { id: 'work',     factor:  0.03 },
      { id: 'projects', factor: -0.05 },
      { id: 'skills',   factor:  0.04 },
      { id: 'blog',     factor: -0.03 },
      { id: 'contact',  factor:  0.02 },
    ];

    var els = layers.map(function (l) {
      return { el: document.getElementById(l.id), factor: l.factor };
    }).filter(function (l) { return l.el; });

    var scrollY = 0, rafPending = false;

    function apply() {
      rafPending = false;
      els.forEach(function (l) {
        var rect  = l.el.getBoundingClientRect();
        var mid   = rect.top + rect.height / 2;
        var offset = (mid - window.innerHeight / 2) * l.factor;
        l.el.style.transform = 'translateY(' + offset.toFixed(2) + 'px)';
      });
    }

    window.addEventListener('scroll', function () {
      scrollY = window.scrollY;
      if (!rafPending) { rafPending = true; requestAnimationFrame(apply); }
    }, { passive: true });

    apply();
  })();


  // ============================================================
  // 5. SCROLL WARP GRID  (Three.js wire-frame plane)
  // A subtle undulating grid sits just above the particle field,
  // warping with scroll position and mouse movement
  // ============================================================
  (function warpGrid() {
    if (!window.THREE) return;
    var THREE = window.THREE;

    var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(1); // intentionally low — this is a subtle BG effect
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    var canvas = renderer.domElement;
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0.18;';
    document.body.insertBefore(canvas, document.body.children[2] || null);

    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 80);
    camera.lookAt(0, 0, 0);

    // subdivided plane viewed from above-ish
    var geo = new THREE.PlaneGeometry(200, 200, 48, 48);
    geo.rotateX(-Math.PI / 3.5);

    var mat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });

    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = -20;
    scene.add(mesh);

    var posAttr    = geo.attributes.position;
    var baseY      = new Float32Array(posAttr.count);
    for (var i = 0; i < posAttr.count; i++) baseY[i] = posAttr.getY(i);

    var scrollFrac = 0, targetScroll = 0;
    var mx = 0, my = 0;

    window.addEventListener('scroll', function () {
      targetScroll = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    }, { passive: true });

    window.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth  - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var t = 0;
    (function tick() {
      requestAnimationFrame(tick);
      t += 0.012;
      scrollFrac += (targetScroll - scrollFrac) * 0.06;

      // undulate vertices
      for (var i = 0; i < posAttr.count; i++) {
        var x = posAttr.getX(i);
        var z = posAttr.getZ(i);
        var wave = Math.sin(x * 0.08 + t) * Math.cos(z * 0.06 + t * 0.7) * 4.5;
        var scrollWave = Math.sin(x * 0.05 + scrollFrac * Math.PI * 4) * 3.0;
        posAttr.setY(i, baseY[i] + wave + scrollWave);
      }
      posAttr.needsUpdate = true;

      // gentle camera drift with mouse
      camera.position.x += (mx * 12 - camera.position.x) * 0.04;
      camera.position.z  = 80 + scrollFrac * -30;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    })();
  })();

})();
