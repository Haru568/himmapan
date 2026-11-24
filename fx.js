// ฉากหลัง อนุภาค และเอฟเฟกต์
var Fx = (function () {
  var THEMES = {
    title: { sky: ['#140d33', '#2b1a5e', '#5b2a7a'], hill: ['#1d1442', '#251a52'], roof: '#120c2b', glow: '#f5c86b', moon: true, particle: 'star' },
    map: { sky: ['#1a1240', '#3b2470', '#c0577a'], hill: ['#24174d', '#2e1d5c'], roof: '#170f35', glow: '#ffd27a', moon: true, particle: 'lantern' },
    dawn: { sky: ['#2a2463', '#a8557f', '#f7a65a'], hill: ['#4a2f6b', '#5d3b78'], roof: '#2b1c45', glow: '#ffcf7a', sun: true, sea: '#3b6aa0', particle: 'petal' },
    jungle: { sky: ['#0f3b3a', '#1d6b5c', '#9fd3a6'], hill: ['#0e3a2f', '#145040'], roof: '#0a2a22', glow: '#bdf5c8', particle: 'firefly' },
    night: { sky: ['#0b0a22', '#1c1748', '#3b2a6b'], hill: ['#15123a', '#1c1846'], roof: '#0b0a22', glow: '#ff9b4a', moon: true, particle: 'ember' },
    boss: { sky: ['#1a0610', '#4a0f22', '#8a1f2f'], hill: ['#2a0a16', '#36101e'], roof: '#14040a', glow: '#ff5a5a', particle: 'ember' }
  };
  var canvas, ctx, parts = [], kind = 'star', raf = null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function roof(x, base, w, h, color, glow) {
    // หลังคาทรงไทยซ้อนชั้น พร้อมช่อฟ้าและเส้นขอบเรืองแสง
    var s = '';
    var tiers = 3;
    for (var i = 0; i < tiers; i++) {
      var tw = w * (1 - i * 0.22), th = h * 0.42, y = base - i * h * 0.28;
      var x0 = x - tw / 2, x1 = x + tw / 2, top = y - th;
      s += '<path d="M' + x0 + ' ' + y + ' L' + (x - tw * 0.08) + ' ' + top + ' L' + (x + tw * 0.08) + ' ' + top + ' L' + x1 + ' ' + y + ' Z" fill="' + color + '"/>';
      s += '<path d="M' + x0 + ' ' + y + ' L' + (x - tw * 0.08) + ' ' + top + ' M' + x1 + ' ' + y + ' L' + (x + tw * 0.08) + ' ' + top + '" stroke="' + glow + '" stroke-width="1.6" opacity=".55" fill="none"/>';
      s += '<path d="M' + x0 + ' ' + y + ' q-' + (tw * 0.04) + ' -' + (th * 0.25) + ' ' + (tw * 0.01) + ' -' + (th * 0.35) + '" stroke="' + glow + '" stroke-width="1.6" opacity=".7" fill="none"/>';
      s += '<path d="M' + x1 + ' ' + y + ' q' + (tw * 0.04) + ' -' + (th * 0.25) + ' -' + (tw * 0.01) + ' -' + (th * 0.35) + '" stroke="' + glow + '" stroke-width="1.6" opacity=".7" fill="none"/>';
    }
    var spireBase = base - (tiers - 1) * h * 0.28 - h * 0.42;
    s += '<path d="M' + (x - 3) + ' ' + spireBase + ' L' + x + ' ' + (spireBase - h * 0.5) + ' L' + (x + 3) + ' ' + spireBase + ' Z" fill="' + color + '"/>';
    s += '<rect x="' + (x - w * 0.36) + '" y="' + base + '" width="' + (w * 0.72) + '" height="400" fill="' + color + '"/>';
    for (var k = -1; k <= 1; k++) s += '<rect x="' + (x + k * w * 0.18 - 5) + '" y="' + (base + 22) + '" width="10" height="16" rx="5" fill="' + glow + '" opacity=".75"/>';
    return s;
  }

  function sceneSVG(name) {
    var t = THEMES[name] || THEMES.title;
    var W = 1600, H = 900;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">';
    s += '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">';
    t.sky.forEach(function (c, i) { s += '<stop offset="' + (i / (t.sky.length - 1)) + '" stop-color="' + c + '"/>'; });
    s += '</linearGradient><radialGradient id="glow"><stop offset="0" stop-color="' + t.glow + '" stop-opacity=".55"/><stop offset="1" stop-color="' + t.glow + '" stop-opacity="0"/></radialGradient></defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#sky)"/>';
    if (t.moon) s += '<circle cx="1270" cy="170" r="190" fill="url(#glow)"/><circle cx="1270" cy="170" r="70" fill="#fdf1d6"/><circle cx="1248" cy="152" r="12" fill="#f3dca8"/><circle cx="1292" cy="196" r="8" fill="#f3dca8"/>';
    if (t.sun) s += '<circle cx="800" cy="560" r="300" fill="url(#glow)"/><circle cx="800" cy="560" r="110" fill="#ffd9a0" opacity=".95"/>';
    s += '<path d="M0 620 L180 470 L320 560 L520 400 L700 560 L860 470 L1040 580 L1240 430 L1420 560 L1600 480 L1600 900 L0 900 Z" fill="' + t.hill[0] + '" opacity=".85"/>';
    if (t.sea) s += '<rect y="640" width="' + W + '" height="260" fill="' + t.sea + '" opacity=".55"/><path d="M0 660 H1600" stroke="#ffd9a0" stroke-width="3" opacity=".5"/>';
    s += '<path d="M0 700 Q300 640 560 700 T1100 690 T1600 700 L1600 900 L0 900 Z" fill="' + t.hill[1] + '"/>';
    s += roof(170, 720, 220, 160, t.roof, t.glow) + roof(420, 760, 160, 120, t.roof, t.glow);
    s += roof(1180, 740, 240, 180, t.roof, t.glow) + roof(1450, 770, 170, 120, t.roof, t.glow);
    s += '<rect y="800" width="' + W + '" height="100" fill="' + t.roof + '"/>';
    s += '</svg>';
    return s;
  }

  function setScene(name) {
    var el = document.getElementById('scene-art');
    if (el.dataset.name === name) return;
    el.dataset.name = name;
    el.innerHTML = sceneSVG(name) + '<img class="bg-img" alt="" src="bg-' + name + '.webp" onerror="this.remove()">';
    kind = (THEMES[name] || THEMES.title).particle;
    parts = [];
  }

  function initParticles() {
    canvas = document.getElementById('scene-fx'); if (!canvas || reduce) return;
    ctx = canvas.getContext('2d');
    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    resize(); addEventListener('resize', resize);
    loop();
  }
  function spawn() {
    var W = canvas.width, H = canvas.height;
    var p = { x: Math.random() * W, y: H + 10, vx: (Math.random() - .5) * .3, vy: -(.2 + Math.random() * .5), r: 1 + Math.random() * 2.5, life: 0, ph: Math.random() * 6 };
    if (kind === 'star') { p.y = Math.random() * H * .6; p.vy = 0; p.vx = 0; }
    if (kind === 'petal') { p.y = -10; p.vy = .5 + Math.random() * .6; p.vx = .4 + Math.random() * .6; p.r = 3 + Math.random() * 3; }
    if (kind === 'lantern') { p.r = 4 + Math.random() * 4; p.vy = -(.25 + Math.random() * .35); }
    parts.push(p);
  }
  function loop() {
    raf = requestAnimationFrame(loop);
    if (!ctx) return;
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (parts.length < 40 && Math.random() < .3) spawn();
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.life++; p.ph += .05;
      p.x += p.vx + Math.sin(p.ph) * .3; p.y += p.vy;
      if (p.y < -20 || p.y > H + 20 || p.x > W + 20 || p.life > 1200) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = kind === 'star' ? .4 + Math.sin(p.ph) * .4 : .8;
      if (kind === 'petal') { ctx.fillStyle = '#ffc2d6'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * .55, p.ph, 0, 6.3); ctx.fill(); }
      else if (kind === 'lantern') { ctx.fillStyle = '#ffb347'; ctx.fillRect(p.x - p.r / 2, p.y - p.r * .7, p.r, p.r * 1.4); ctx.fillStyle = 'rgba(255,220,150,.35)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2, 0, 6.3); ctx.fill(); }
      else if (kind === 'ember') { ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * .8, 0, 6.3); ctx.fill(); }
      else if (kind === 'firefly') { ctx.fillStyle = '#d6ff8a'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill(); }
      else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * .6, 0, 6.3); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  function confetti(n) {
    if (reduce) return;
    var colors = ['#f5c86b', '#e57bb8', '#5dcad5', '#9b7bea', '#7fd99a', '#ff8a3d'];
    for (var i = 0; i < (n || 90); i++) {
      var d = document.createElement('div'); d.className = 'confetti';
      d.style.left = (Math.random() * 100) + 'vw';
      d.style.background = colors[i % colors.length];
      d.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
      d.style.animationDelay = (Math.random() * .4) + 's';
      d.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      document.body.appendChild(d);
      setTimeout(function (el) { el.remove(); }.bind(null, d), 4000);
    }
  }
  function floatText(x, y, text, cls) {
    var d = document.createElement('div'); d.className = 'float-text ' + (cls || '');
    d.textContent = text; d.style.left = x + 'px'; d.style.top = y + 'px';
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1400);
  }
  function sparkle(el) {
    if (!el || reduce) return;
    var r = el.getBoundingClientRect();
    for (var i = 0; i < 12; i++) {
      var d = document.createElement('div'); d.className = 'sparkle';
      d.style.left = (r.left + r.width / 2) + 'px'; d.style.top = (r.top + r.height / 2) + 'px';
      var a = Math.random() * 6.28, dist = 40 + Math.random() * 60;
      d.style.setProperty('--dx', Math.cos(a) * dist + 'px'); d.style.setProperty('--dy', Math.sin(a) * dist + 'px');
      document.body.appendChild(d); setTimeout(function (el) { el.remove(); }.bind(null, d), 900);
    }
  }
  function shake(el) { if (!el || reduce) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

  return { setScene: setScene, initParticles: initParticles, confetti: confetti, floatText: floatText, sparkle: sparkle, shake: shake };
})();
