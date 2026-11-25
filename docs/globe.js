// Small dotted globe for the Languages section. Land dots come from img/langmap.png
// (red channel / 25 = language id: 1 pt, 2 en, 3 fr, 4 nl, 5 de, 6 es, 9 other land).
// Loaded only when the section is near the viewport. Purely decorative: the list
// next to it carries the same information as text.
const canvas = document.getElementById('globe');
const legend = document.getElementById('legend');


// Legend highlighting works on its own; the globe joins in once it has loaded.
let hiLang = () => {}, current = 0;
function setHi(li) {
  current = li ? +li.dataset.lang : 0;
  legend.querySelectorAll('li').forEach((l) => l.classList.toggle('hi', l === li));
  hiLang(current);
}
if (legend) legend.querySelectorAll('li').forEach((li) => {
  li.addEventListener('pointerenter', () => setHi(li));
  li.addEventListener('focus', () => setHi(li));
  li.addEventListener('pointerleave', () => setHi(null));
  li.addEventListener('blur', () => setHi(null));
});

function start() {
  import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js')
    .then((THREE) => init(THREE))
    .catch(() => {}); // no network or no WebGL: the beige disc and the text remain
}

function init(THREE) {
  // Colours are used exactly as written in CSS: no linear/sRGB conversion anywhere.
  THREE.ColorManagement.enabled = false;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return; }
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  const css = getComputedStyle(document.documentElement);
  const col = (n) => new THREE.Color(css.getPropertyValue(n).trim());
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 17);

  const R = 4;
  const tilt = new THREE.Group(); // leans the globe so Europe sits near the middle
  const spin = new THREE.Group();
  tilt.add(spin); scene.add(tilt);
  tilt.rotation.x = 0.32;
  const toRad = Math.PI / 180;
  spin.rotation.y = (-90 - -22) * toRad; // face longitude -22: Brazil, Iberia, Africa and Europe in view

  // night-side sphere, a little lighter towards the edge (as on the old site)
  const fres = 'varying vec3 vN, vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }';
  spin.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 64, 40), new THREE.ShaderMaterial({
    uniforms: { uA: { value: col('--l-sea') }, uB: { value: col('--l-sea-edge') } },
    vertexShader: fres,
    fragmentShader: 'uniform vec3 uA, uB; varying vec3 vN, vV; void main(){ float f = pow(1. - abs(dot(vN, vV)), 2.); gl_FragColor = vec4(mix(uA, uB, f), 1.); }',
  })));

  const img = new Image();
  img.src = 'img/langmap.png';
  img.onload = () => {
    const W = img.width, H = img.height;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
    const px = cx.getImageData(0, 0, W, H).data;
    const pos = [], lang = [];
    const STEP = 3; // one dot every 1.5 degrees
    for (let y = 1; y < H; y += STEP) {
      const lat = 90 - (y + 0.5) * (180 / H);
      const sx = Math.round(STEP / Math.max(Math.cos(lat * toRad), 0.15)); // even spacing towards the poles
      for (let x = (Math.floor(y / STEP) % 2) * (sx >> 1); x < W; x += sx) {
      const k = Math.round(px[(y * W + x) * 4] / 25);
      if (!(k >= 1)) continue;
      const lon = -180 + (x + 0.5) * (360 / W);
      const phi = (90 - lat) * toRad, th = (lon + 180) * toRad;
      pos.push(-R * Math.sin(phi) * Math.cos(th), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(th));
      lang.push(k === 9 ? 0 : k);
    } }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aLang', new THREE.Float32BufferAttribute(lang, 1));
    const pal = ['--l-land', '--l-pt', '--l-en', '--l-fr', '--l-nl', '--l-de', '--l-es'].map(col);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { uPal: { value: pal }, uHi: { value: 0 }, uPx: { value: 1 } },
      vertexShader: `attribute float aLang; uniform float uPx; varying float vL;
        void main(){ vL = aLang; vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = (aLang > .5 ? 4.4 : 3.4) * uPx; }`,
      fragmentShader: `uniform vec3 uPal[7]; uniform float uHi; varying float vL;
        void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard;
          int i = int(vL + .5); vec3 c = uPal[0]; for (int k = 1; k < 7; k++) if (k == i) c = uPal[k];
          float a = vL > .5 ? 1. : .5;
          if (uHi > .5) { bool on = abs(vL - uHi) < .5; c = on ? c : uPal[0]; a = on ? 1. : .35; }
          gl_FragColor = vec4(c, a * smoothstep(.5, .35, d)); }`,
    });
    const land = new THREE.Points(g, mat);
    spin.add(land);

    hiLang = (n) => { mat.uniforms.uHi.value = n; kick(); };
    hiLang(current);
    resize(); kick();
  };

  // size
  function resize() {
    const w = canvas.clientWidth, dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr); renderer.setSize(w, w, false);
    scene.traverse((o) => { if (o.material && o.material.uniforms && o.material.uniforms.uPx) o.material.uniforms.uPx.value = dpr * (w / 420); });
    kick();
  }
  new ResizeObserver(resize).observe(canvas);

  // drag to turn, with momentum: speed is measured over time while dragging,
  // then decays slowly (half-life about 0.9 s) back to the gentle idle spin
  const IDLE = reduce ? 0 : 0.0001;   // rad per ms
  const MAX = 0.014;                  // rad per ms, so a hard flick stays readable
  const DECAY = 0.99925;              // per ms
  let drag = null, vel = IDLE, last = 0;
  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, t: performance.now() };
    vel = 0; canvas.setPointerCapture(e.pointerId); kick();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const now = performance.now(), dt = Math.max(now - drag.t, 1);
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag = { x: e.clientX, y: e.clientY, t: now };
    spin.rotation.y += dx * 0.008;
    tilt.rotation.x = Math.max(-0.2, Math.min(1.1, tilt.rotation.x + dy * 0.006));
    const v = (dx * 0.008) / dt;
    vel = vel * 0.6 + v * 0.4; // smooth over the last few events
    kick();
  });
  const end = () => {
    if (!drag) return;
    if (performance.now() - drag.t > 90) vel = 0; // held still before letting go: no throw
    vel = Math.max(-MAX, Math.min(MAX, vel));
    drag = null; kick();
  };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

  // render loop: idles when nothing moves or the globe is off screen
  let visible = true, raf = 0;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(canvas);
  function frame(now) {
    raf = 0;
    const dt = Math.min(now - (last || now), 50); last = now;
    if (!drag) {
      const target = Math.sign(vel || 1) * IDLE; // keep turning the way it was thrown
      vel = target + (vel - target) * Math.pow(DECAY, dt);
      spin.rotation.y += vel * dt;
    }
    renderer.render(scene, camera);
    if (visible && (drag || Math.abs(vel) > 1e-6)) kick(); else last = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
}

if (canvas && legend) {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
  }, { rootMargin: '400px' });
  io.observe(canvas);
}
