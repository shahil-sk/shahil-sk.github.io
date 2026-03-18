// three-scene.js
// Boots a Three.js WebGL particle field as the site background.
// Three.js is loaded via CDN script tag injected synchronously into <head>
// so it is guaranteed ready before this runs.

(function () {
  // hide the old 2d placeholder
  var old = document.getElementById('matrix-canvas');
  if (old) old.style.display = 'none';

  var THREE = window.THREE;
  if (!THREE) {
    // THREE not loaded yet — wait for the CDN script tag we injected in index.html
    document.querySelector('#three-cdn').addEventListener('load', init);
    return;
  }
  init();

  function init() {
    var THREE = window.THREE;

    var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // sit directly behind everything else but above nothing
    var canvas = renderer.domElement;
    canvas.id = 'threejs-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    document.body.insertBefore(canvas, document.body.firstChild);

    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 120;

    scene.fog = new THREE.FogExp2(0x030303, 0.005);

    // --- main particle cloud ---
    var N = 3000;
    var pos = new Float32Array(N * 3);
    var col = new Float32Array(N * 3);
    var sz  = new Float32Array(N);

    for (var i = 0; i < N; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 500;
      pos[i*3+1] = (Math.random() - 0.5) * 500;
      pos[i*3+2] = (Math.random() - 0.5) * 350;

      var t = Math.random();
      if (t < 0.10) {          // bright red
        col[i*3] = 1; col[i*3+1] = 0; col[i*3+2] = 0;
      } else if (t < 0.30) {   // dim red
        col[i*3] = 0.25; col[i*3+1] = 0; col[i*3+2] = 0;
      } else {                  // near-black
        col[i*3] = 0.06; col[i*3+1] = 0; col[i*3+2] = 0;
      }
      sz[i] = Math.random() * 2.0 + 0.5;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sz,  1));

    var mat = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: [
        'attribute float size;',
        'attribute vec3 color;',
        'varying vec3 vColor;',
        'void main(){',
        '  vColor = color;',
        '  vec4 mv = modelViewMatrix * vec4(position,1.0);',
        '  gl_PointSize = size * (180.0 / -mv.z);',
        '  gl_Position  = projectionMatrix * mv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vColor;',
        'void main(){',
        '  vec2 uv = gl_PointCoord - 0.5;',
        '  float d = length(uv);',
        '  if(d > 0.5) discard;',
        '  float a = smoothstep(0.5, 0.0, d) * 0.85;',
        '  gl_FragColor = vec4(vColor, a);',
        '}'
      ].join('\n'),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    var cloud = new THREE.Points(geo, mat);
    scene.add(cloud);

    // --- accent pulse dots ---
    var AN = 200;
    var ap = new Float32Array(AN * 3);
    for (var j = 0; j < AN; j++) {
      ap[j*3]   = (Math.random()-0.5)*400;
      ap[j*3+1] = (Math.random()-0.5)*400;
      ap[j*3+2] = (Math.random()-0.5)*250;
    }
    var ag = new THREE.BufferGeometry();
    ag.setAttribute('position', new THREE.BufferAttribute(ap, 3));
    var am = new THREE.PointsMaterial({
      color: 0xff0000, size: 1.6,
      transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(ag, am));

    // --- mouse parallax ---
    var mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', function(e){
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('resize', function(){
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var t = 0;
    (function tick() {
      requestAnimationFrame(tick);
      t += 0.003;
      cloud.rotation.y = t * 0.05;
      cloud.rotation.x = t * 0.02;
      cx += (mx * 20 - cx) * 0.035;
      cy += (-my * 12 - cy) * 0.035;
      camera.position.x = cx;
      camera.position.y = cy;
      camera.lookAt(scene.position);
      am.opacity = 0.45 + Math.sin(t * 2.5) * 0.18;
      renderer.render(scene, camera);
    })();
  }
})();
