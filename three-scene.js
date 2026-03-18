// three-scene.js
// Full 3D background: Three.js particle field with mouse-reactive camera
// Replaces the flat 2D matrix canvas completely

(function () {
  // only run on pages that have the old matrix canvas placeholder
  const placeholder = document.getElementById('matrix-canvas');
  if (!placeholder) return;

  // hide the old 2d canvas — three.js takes over visually
  placeholder.style.display = 'none';

  // load three.js from CDN then boot the scene
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = bootScene;
  document.head.appendChild(script);

  function bootScene() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    // --- renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = [
      'position:fixed', 'top:0', 'left:0',
      'width:100%', 'height:100%',
      'z-index:0', 'pointer-events:none'
    ].join(';');
    document.body.insertBefore(renderer.domElement, document.body.firstChild);

    // --- scene + camera ---
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 2000);
    camera.position.set(0, 0, 120);

    // subtle depth fog matching site bg
    scene.fog = new THREE.FogExp2(0x030303, 0.006);

    // --- particle geometry ---
    const PARTICLE_COUNT = 3200;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors    = new Float32Array(PARTICLE_COUNT * 3);
    const sizes     = new Float32Array(PARTICLE_COUNT);

    const redColor  = new THREE.Color(0xff0000);
    const dimColor  = new THREE.Color(0x330000);
    const faintWhite = new THREE.Color(0x1a0000);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // distribute across a wide 3d volume
      positions[i * 3]     = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

      // mix of red accent and near-black to feel like the site palette
      const t = Math.random();
      const c = t < 0.12 ? redColor : (t < 0.35 ? dimColor : faintWhite);
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 1.8 + 0.4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    // custom shader material so we get round, glowing points
    const mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          // round soft dot
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d) * 0.75;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // secondary sparse bright-red layer — like site accent glows
    const ACCENT_COUNT = 180;
    const aPos = new Float32Array(ACCENT_COUNT * 3);
    for (let i = 0; i < ACCENT_COUNT; i++) {
      aPos[i * 3]     = (Math.random() - 0.5) * 350;
      aPos[i * 3 + 1] = (Math.random() - 0.5) * 350;
      aPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    const aGeo = new THREE.BufferGeometry();
    aGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
    const aMat = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 1.4,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(aGeo, aMat));

    // --- mouse tracking for parallax camera ---
    let targetX = 0, targetY = 0;
    let mouseX  = 0, mouseY  = 0;

    window.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // --- resize ---
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // --- animation loop ---
    let clock = 0;
    function animate() {
      requestAnimationFrame(animate);
      clock += 0.004;

      // slow drift rotation of the whole particle field
      particles.rotation.y  = clock * 0.06;
      particles.rotation.x  = clock * 0.025;

      // smooth camera follow mouse — subtle parallax depth
      targetX += (mouseX * 18 - targetX) * 0.04;
      targetY += (-mouseY * 10 - targetY) * 0.04;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(scene.position);

      // pulse the red accent layer brightness
      aMat.opacity = 0.45 + Math.sin(clock * 2.2) * 0.15;

      renderer.render(scene, camera);
    }
    animate();
  }
})();
