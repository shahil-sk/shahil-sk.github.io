// fx.js
// 3D effects: section flip reveals, depth orbs, parallax layers, warp grid
// magnetic cursor removed per request

(function () {
  'use strict';

  // ============================================================
  // 1. 3D SECTION REVEAL  (rotateX flip on scroll)
  // ============================================================
  (function section3DReveal() {
    document.querySelectorAll('.section').forEach(function (sec) {
      sec.style.perspective = '1200px';
      var inner = sec.querySelector('.section-inner');
      if (!inner) return;
      inner.style.transformOrigin  = '50% 0%';
      inner.style.transition       = 'transform 0.9s cubic-bezier(0.16,1,0.3,1), opacity 0.9s cubic-bezier(0.16,1,0.3,1)';
      inner.style.opacity           = '0';
      inner.style.transform         = 'rotateX(14deg) translateY(40px)';

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
  // 2. FLOATING DEPTH ORBS
  // ============================================================
  (function depthOrbs() {
    var orbs = [
      { x: '12%',  y: '18%',  size: 560, dur: 20, delay: 0  },
      { x: '80%',  y: '50%',  size: 420, dur: 24, delay: 5  },
      { x: '45%',  y: '78%',  size: 640, dur: 28, delay: 10 },
      { x: '90%',  y: '8%',   size: 320, dur: 18, delay: 3  },
      { x: '3%',   y: '62%',  size: 380, dur: 22, delay: 14 },
    ];
    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden';
    document.body.insertBefore(container, document.body.children[1] || null);
    orbs.forEach(function (o) {
      var el = document.createElement('div');
      el.style.cssText = [
        'position:absolute', 'left:' + o.x, 'top:' + o.y,
        'width:' + o.size + 'px', 'height:' + o.size + 'px',
        'border-radius:50%',
        'background:radial-gradient(circle,rgba(255,0,0,0.048) 0%,transparent 70%)',
        'filter:blur(72px)', 'transform:translate(-50%,-50%)',
        'animation:orb-drift ' + o.dur + 's ease-in-out ' + o.delay + 's infinite alternate',
        'will-change:transform'
      ].join(';');
      container.appendChild(el);
    });
    var s = document.createElement('style');
    s.textContent = '@keyframes orb-drift{0%{transform:translate(-50%,-50%) scale(1) rotate(0deg)}33%{transform:translate(calc(-50% + 44px),calc(-50% - 32px)) scale(1.09) rotate(4deg)}66%{transform:translate(calc(-50% - 28px),calc(-50% + 48px)) scale(0.93) rotate(-3deg)}100%{transform:translate(-50%,-50%) scale(1.05) rotate(1deg)}}';
    document.head.appendChild(s);
  })();


  // ============================================================
  // 3. PARALLAX SECTION LAYERS
  // ============================================================
  (function parallaxSections() {
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
    var rafPending = false;
    function apply() {
      rafPending = false;
      els.forEach(function (l) {
        var mid = l.el.getBoundingClientRect().top + l.el.getBoundingClientRect().height / 2;
        var offset = (mid - window.innerHeight / 2) * l.factor;
        l.el.style.transform = 'translateY(' + offset.toFixed(2) + 'px)';
      });
    }
    window.addEventListener('scroll', function () {
      if (!rafPending) { rafPending = true; requestAnimationFrame(apply); }
    }, { passive: true });
    apply();
  })();


  // ============================================================
  // 4. SCROLL WARP GRID
  // ============================================================
  (function warpGrid() {
    if (!window.THREE) return;
    var THREE = window.THREE;
    var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    var canvas = renderer.domElement;
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0.15;';
    document.body.insertBefore(canvas, document.body.children[2] || null);
    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 80);
    camera.lookAt(0, 0, 0);
    var geo  = new THREE.PlaneGeometry(200, 200, 48, 48);
    geo.rotateX(-Math.PI / 3.5);
    var mat  = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, transparent: true, opacity: 0.18 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = -20;
    scene.add(mesh);
    var posAttr = geo.attributes.position;
    var baseY   = new Float32Array(posAttr.count);
    for (var i = 0; i < posAttr.count; i++) baseY[i] = posAttr.getY(i);
    var scrollFrac = 0, targetScroll = 0, mx = 0;
    window.addEventListener('scroll', function () {
      targetScroll = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    }, { passive: true });
    window.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5);
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
      for (var i = 0; i < posAttr.count; i++) {
        var x = posAttr.getX(i), z = posAttr.getZ(i);
        posAttr.setY(i, baseY[i] +
          Math.sin(x * 0.08 + t) * Math.cos(z * 0.06 + t * 0.7) * 4.5 +
          Math.sin(x * 0.05 + scrollFrac * Math.PI * 4) * 3.0
        );
      }
      posAttr.needsUpdate = true;
      camera.position.x += (mx * 12 - camera.position.x) * 0.04;
      camera.position.z   = 80 + scrollFrac * -30;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    })();
  })();

})();
