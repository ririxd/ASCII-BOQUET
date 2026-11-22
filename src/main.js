import './style.css';

const canvas = document.querySelector('#bouquet');
const ctx = canvas.getContext('2d');

let width = 0;
let height = 0;
let dpr = 1;
let raf = 0;
let start = 0;
const loopDuration = 4600;

const colors = ['#ff45ca', '#ff87d5', '#9d63ff', '#53d7ff', '#65ffcb', '#ffe16a'];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function pointOnQuadratic(a, c, b, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * a.x + 2 * mt * t * c.x + t * t * b.x,
    y: mt * mt * a.y + 2 * mt * t * c.y + t * t * b.y
  };
}

function bouquetGeometry() {
  const s = Math.min(width / 900, height / 760);
  const cx = width * 0.5;
  const cy = height * 0.56;

  const stems = [
    { a: { x: cx - 28 * s, y: cy + 180 * s }, c: { x: cx - 170 * s, y: cy + 30 * s }, b: { x: cx - 220 * s, y: cy - 95 * s }, color: '#53d7ff' },
    { a: { x: cx - 18 * s, y: cy + 190 * s }, c: { x: cx - 100 * s, y: cy + 20 * s }, b: { x: cx - 125 * s, y: cy - 175 * s }, color: '#65ffcb' },
    { a: { x: cx, y: cy + 190 * s }, c: { x: cx + 5 * s, y: cy - 20 * s }, b: { x: cx + 2 * s, y: cy - 230 * s }, color: '#65ffcb' },
    { a: { x: cx + 25 * s, y: cy + 185 * s }, c: { x: cx + 130 * s, y: cy + 15 * s }, b: { x: cx + 145 * s, y: cy - 155 * s }, color: '#53d7ff' },
    { a: { x: cx + 42 * s, y: cy + 175 * s }, c: { x: cx + 175 * s, y: cy + 20 * s }, b: { x: cx + 220 * s, y: cy - 75 * s }, color: '#65ffcb' }
  ];

  const flowers = [
    { x: cx - 220 * s, y: cy - 95 * s, r: 58 * s, petals: 7, color: '#ff45ca', inner: '#ffe16a', phase: 0.1 },
    { x: cx - 125 * s, y: cy - 175 * s, r: 68 * s, petals: 8, color: '#9d63ff', inner: '#ff87d5', phase: 0.5 },
    { x: cx + 2 * s, y: cy - 230 * s, r: 78 * s, petals: 9, color: '#ff87d5', inner: '#fff09a', phase: 0.9 },
    { x: cx + 145 * s, y: cy - 155 * s, r: 64 * s, petals: 8, color: '#53d7ff', inner: '#ff87d5', phase: 1.3 },
    { x: cx + 220 * s, y: cy - 75 * s, r: 55 * s, petals: 7, color: '#ffe16a', inner: '#ff45ca', phase: 1.7 }
  ];

  return { s, cx, cy, stems, flowers };
}

function glowLine(a, b, color, widthPx = 2, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.lineWidth = widthPx;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function drawStem(stem, progress) {
  ctx.save();
  ctx.strokeStyle = stem.color;
  ctx.shadowColor = stem.color;
  ctx.shadowBlur = 12;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const steps = Math.ceil(30 * progress);
  for (let i = 0; i <= steps; i++) {
    const t = (i / 30) * progress;
    const p = pointOnQuadratic(stem.a, stem.c, stem.b, t);
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawPetals(flower, progress, time) {
  if (progress <= 0) return;
  ctx.save();
  ctx.translate(flower.x, flower.y);
  ctx.rotate(Math.sin(time * 0.0007 + flower.phase) * 0.025);
  ctx.globalAlpha = Math.min(1, progress * 1.8);

  const reveal = Math.min(1, progress);
  for (let i = 0; i < flower.petals; i++) {
    const angle = (Math.PI * 2 * i) / flower.petals + flower.phase * 0.12;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(flower.r * 0.34, 0, flower.r * 0.44 * reveal, flower.r * 0.19 * reveal, 0, 0, Math.PI * 2);
    ctx.fillStyle = flower.color;
    ctx.shadowColor = flower.color;
    ctx.shadowBlur = 22;
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, flower.r * 0.22 * reveal, 0, Math.PI * 2);
  ctx.fillStyle = flower.inner;
  ctx.shadowColor = flower.inner;
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.restore();
}

function drawLeaf(a, b, c, color, progress) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, progress * 2);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(c.x, c.y, b.x, b.y);
  ctx.quadraticCurveTo(c.x - (b.y - a.y) * 0.12, c.y + (b.x - a.x) * 0.12, a.x, a.y);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawShootingStar(star, elapsed) {
  const duration = star.duration;
  const t = (elapsed - star.delay) / duration;
  if (t < 0 || t > 1) return;

  const a = star.a;
  const b = star.b;
  const c = star.c;
  const p = pointOnQuadratic(a, c, b, Math.min(1, t));
  const prevT = Math.max(0, t - 0.18);
  const prev = pointOnQuadratic(a, c, b, prevT);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = star.color;
  ctx.shadowColor = star.color;
  ctx.shadowBlur = 22;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(prev.x, prev.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.shadowColor = star.color;
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function createStars(geom) {
  const stars = geom.stems.map((stem, i) => ({
    a: stem.a,
    c: stem.c,
    b: stem.b,
    color: stem.color,
    delay: 350 + i * 420,
    duration: 1500
  }));

  geom.flowers.forEach((flower, i) => {
    stars.push({
      a: { x: flower.x - flower.r * 0.78, y: flower.y },
      c: { x: flower.x, y: flower.y - flower.r * 0.92 },
      b: { x: flower.x + flower.r * 0.78, y: flower.y },
      color: flower.color,
      delay: 1800 + i * 260,
      duration: 1100
    });
  });
  return stars;
}

function animate(time) {
  ctx.clearRect(0, 0, width, height);
  const geom = bouquetGeometry();
  const stars = createStars(geom);
  const elapsed = (time - start) % loopDuration;

  for (let i = 0; i < 48; i++) {
    const seed = i * 91.7;
    const x = (Math.sin(seed * 1.9) * 0.5 + 0.5) * width;
    const y = (Math.cos(seed * 0.73) * 0.5 + 0.5) * height;
    const pulse = 0.3 + 0.7 * Math.pow(Math.max(0, Math.sin(time * 0.0015 + seed)), 8);
    ctx.fillStyle = `rgba(255, 170, 255, ${0.22 * pulse})`;
    ctx.beginPath();
    ctx.arc(x, y, 1 + pulse * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  geom.stems.forEach((stem, i) => {
    const progress = Math.min(1, Math.max(0, (elapsed - 350 - i * 420) / 1500));
    drawStem(stem, progress);
  });

  const leafPairs = [
    [{ x: geom.cx - 80 * geom.s, y: geom.cy + 70 * geom.s }, { x: geom.cx - 210 * geom.s, y: geom.cy - 5 * geom.s }, { x: geom.cx - 155 * geom.s, y: geom.cy - 20 * geom.s }],
    [{ x: geom.cx - 45 * geom.s, y: geom.cy + 100 * geom.s }, { x: geom.cx + 145 * geom.s, y: geom.cy + 15 * geom.s }, { x: geom.cx + 100 * geom.s, y: geom.cy - 5 * geom.s }],
    [{ x: geom.cx + 15 * geom.s, y: geom.cy + 75 * geom.s }, { x: geom.cx - 65 * geom.s, y: geom.cy - 20 * geom.s }, { x: geom.cx - 20 * geom.s, y: geom.cy - 5 * geom.s }],
    [{ x: geom.cx + 55 * geom.s, y: geom.cy + 60 * geom.s }, { x: geom.cx + 195 * geom.s, y: geom.cy - 12 * geom.s }, { x: geom.cx + 145 * geom.s, y: geom.cy - 10 * geom.s }]
  ];

  leafPairs.forEach((leaf, i) => {
    const progress = Math.min(1, Math.max(0, (elapsed - 1100 - i * 180) / 700));
    drawLeaf(leaf[0], leaf[1], leaf[2], i % 2 ? '#53d7ff' : '#65ffcb', progress);
  });

  geom.flowers.forEach((flower, i) => {
    const progress = Math.min(1, Math.max(0, (elapsed - 1750 - i * 260) / 900));
    drawPetals(flower, progress, time);
  });

  stars.forEach(star => drawShootingStar(star, elapsed));

  const ribbonProgress = Math.min(1, Math.max(0, (elapsed - 3200) / 900));
  if (ribbonProgress > 0) {
    const { cx, cy, s } = geom;
    ctx.save();
    ctx.globalAlpha = ribbonProgress;
    ctx.strokeStyle = '#ff87d5';
    ctx.shadowColor = '#ff45ca';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 7 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 78 * s, cy + 155 * s);
    ctx.quadraticCurveTo(cx, cy + 205 * s, cx + 78 * s, cy + 155 * s);
    ctx.stroke();
    ctx.restore();
  }

  raf = requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
start = performance.now();
raf = requestAnimationFrame(animate);
