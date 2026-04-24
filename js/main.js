// Smooth scroll helper
function scrollTo(selector) {
  document.querySelector(selector).scrollIntoView({ behavior: 'smooth' });
}

// Card flip handled below (touch-aware)

// ── STARFIELD + COMETS ──────────────────────────────────────
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initStars(); });

// Stars
let stars = [];
function initStars() {
  stars = [];
  const count = Math.floor((canvas.width * canvas.height) / 3000);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
      color: Math.random() > 0.85 ? '#C9A84C' : (Math.random() > 0.7 ? '#C8C8D4' : '#ffffff'),
    });
  }
}
initStars();

// Comets
let comets = [];
function spawnComet() {
  const angle = (Math.random() * 160 + 10) * Math.PI / 180; // mostly left-to-right but random
  const speed = Math.random() * 6 + 4;
  // start from random edge
  let x, y;
  const edge = Math.floor(Math.random() * 3);
  if (edge === 0) { x = Math.random() * canvas.width; y = 0; }
  else if (edge === 1) { x = 0; y = Math.random() * canvas.height * 0.6; }
  else { x = canvas.width; y = Math.random() * canvas.height * 0.6; }

  comets.push({
    x, y,
    vx: Math.cos(angle) * speed * (edge === 2 ? -1 : 1),
    vy: Math.sin(angle) * speed,
    length: Math.random() * 180 + 80,
    alpha: 1,
    width: Math.random() * 1.5 + 0.5,
    color: Math.random() > 0.5 ? '#C8C8D4' : '#C9A84C',
    life: 0,
    maxLife: Math.random() * 60 + 40,
  });
}

// Spawn comets randomly
setInterval(() => {
  if (comets.length < 5) spawnComet();
}, Math.random() * 2000 + 800);

function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw stars
  for (const s of stars) {
    s.alpha += s.twinkleSpeed * s.twinkleDir;
    if (s.alpha > 1) { s.alpha = 1; s.twinkleDir = -1; }
    if (s.alpha < 0.1) { s.alpha = 0.1; s.twinkleDir = 1; }
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = s.alpha;
    ctx.fill();
  }

  // Draw comets
  ctx.globalAlpha = 1;
  for (let i = comets.length - 1; i >= 0; i--) {
    const c = comets[i];
    c.x += c.vx;
    c.y += c.vy;
    c.life++;
    const progress = c.life / c.maxLife;
    const fadeAlpha = progress < 0.3 ? progress / 0.3 : 1 - ((progress - 0.3) / 0.7);

    const tailX = c.x - (c.vx / Math.hypot(c.vx, c.vy)) * c.length;
    const tailY = c.y - (c.vy / Math.hypot(c.vx, c.vy)) * c.length;

    const grad = ctx.createLinearGradient(tailX, tailY, c.x, c.y);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, c.color);

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(c.x, c.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = c.width;
    ctx.globalAlpha = fadeAlpha * 0.9;
    ctx.stroke();

    // Head glow
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.width * 2, 0, Math.PI * 2);
    ctx.fillStyle = c.color;
    ctx.globalAlpha = fadeAlpha;
    ctx.fill();

    if (c.life >= c.maxLife) comets.splice(i, 1);
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawFrame);
}
drawFrame();
// ─────────────────────────────────────────────────────────────

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => observer.observe(el));


// ── SIDEBAR TOGGLE ───────────────────────────────────────────
const hamburger = document.getElementById('navHamburger');
const sidebar   = document.getElementById('navSidebar');
const overlay   = document.getElementById('navOverlay');
const closeBtn  = document.getElementById('sidebarClose');

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openSidebar);
if (closeBtn)  closeBtn.addEventListener('click', closeSidebar);
if (overlay)   overlay.addEventListener('click', closeSidebar);

// Close sidebar when a link is tapped
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', closeSidebar);
});

// ── TOUCH CARD FLIP ──────────────────────────────────────────
// On touch devices, tap flips card instead of hover
const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

// Card interactions — touch vs desktop
document.querySelectorAll('.card-3d-wrap').forEach(wrap => {
  const card = wrap.querySelector('.card-3d');
  if (!card) return;

  if (isTouch) {
    // Tap to toggle — no 3D, just show/hide
    wrap.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close all other open cards first
      document.querySelectorAll('.card-3d.flipped').forEach(c => {
        if (c !== card) c.classList.remove('flipped');
      });
      card.classList.toggle('flipped');
    });
  } else {
    // Desktop hover
    wrap.addEventListener('mouseenter', () => card.classList.add('flipped'));
    wrap.addEventListener('mouseleave', () => card.classList.remove('flipped'));
  }
});

// Tap outside to close flipped cards on mobile
if (isTouch) {
  document.addEventListener('click', () => {
    document.querySelectorAll('.card-3d.flipped').forEach(c => {
      c.classList.remove('flipped');
    });
  });
}

// ── CANVAS RESIZE ────────────────────────────────────────────
// Ensure canvas always fills its parent hero div
function resizeCanvas() {
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  canvas.width  = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
}
// Override the earlier resizeCanvas and re-init
window.removeEventListener('resize', resizeCanvas);
window.addEventListener('resize', () => {
  resizeCanvas();
  initStars();
});
resizeCanvas();
initStars();
