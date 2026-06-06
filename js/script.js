/* ===== BRENT // Cybersecurity — interactions ===== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Matrix digital rain ---------- */
  const canvas = $('#matrix'), ctx = canvas.getContext('2d');
  let cols, drops, fontSize = 16;
  const glyphs = 'アカサタabcdef0123456789#$%&!?<>{}[]/*-+'.split('');
  function resize() {
    canvas.width = innerWidth; canvas.height = innerHeight;
    cols = Math.floor(canvas.width / fontSize);
    drops = Array(cols).fill(1);
  }
  function rain() {
    ctx.fillStyle = 'rgba(2,5,10,0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88'; ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const ch = glyphs[(Math.random() * glyphs.length) | 0];
      ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  addEventListener('resize', resize); resize();
  if (!reduce) setInterval(rain, 55);

  /* ---------- Boot loader ---------- */
  const bootLines = [
    'BRENT SECURE BOOT v4.8', 'Initializing kernel modules......... [OK]',
    'Mounting encrypted volumes.......... [OK]', 'Starting intrusion detection........ [OK]',
    'Loading neural defense grid......... [OK]', 'Establishing VPN tunnel............. [OK]',
    'Access granted. Welcome, operator.'
  ];
  const bootEl = $('#bootlog'), bootBox = $('#boot');
  let bl = 0;
  (function bootType() {
    if (bl < bootLines.length) {
      bootEl.textContent += bootLines[bl++] + '\n';
      setTimeout(bootType, reduce ? 60 : 320);
    } else {
      setTimeout(() => { bootBox.classList.add('done'); startTyping(); }, 500);
    }
  })();

  /* ---------- Hero typing ---------- */
  const phrases = [
    'Learn ethical hacking from zero.',
    'Defend networks. Break nothing illegal.',
    'Capture flags. Capture knowledge.',
    'Security is a mindset, not a tool.'
  ];
  function startTyping() {
    const el = $('#typed'); let p = 0, c = 0, del = false;
    (function loop() {
      const word = phrases[p];
      c += del ? -1 : 1;
      el.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(loop, 1600); }
      if (del && c === 0) { del = false; p = (p + 1) % phrases.length; }
      setTimeout(loop, del ? 35 : 70);
    })();
  }

  /* ---------- Fake terminal ---------- */
  const termSeq = [
    '$ whoami', 'brent-operator',
    '$ nmap -sV 10.0.0.0/24', 'Scanning 256 hosts... 4 up.',
    'PORT     STATE  SERVICE', '22/tcp   open   ssh',
    '443/tcp  open   https', '$ run defense-grid --mode=ethical',
    '[✓] Monitoring traffic', '[✓] All systems nominal'
  ];
  const termBody = $('#termBody'); let ti = 0, tc = 0;
  function termType() {
    if (ti >= termSeq.length) { setTimeout(() => { termBody.textContent = ''; ti = 0; tc = 0; termType(); }, 4000); return; }
    const line = termSeq[ti];
    termBody.textContent = termBody.textContent.replace(/▌$/, '') + line[tc++] + '▌';
    if (tc === line.length) {
      termBody.textContent = termBody.textContent.replace(/▌$/, '') + '\n';
      ti++; tc = 0; setTimeout(termType, 380);
    } else setTimeout(termType, reduce ? 5 : 28);
  }
  termType();

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count; let n = 0;
      const step = () => { n += Math.ceil(target / 40); if (n >= target) n = target; el.textContent = n; if (n < target) requestAnimationFrame(step); };
      step(); io.unobserve(el);
    });
  }, { threshold: .5 });
  counters.forEach(c => io.observe(c));

  /* ---------- Traffic chart (canvas) ---------- */
  function lineChart(id, color) {
    const cv = $(id); if (!cv) return; const c = cv.getContext('2d');
    cv.width = cv.clientWidth * devicePixelRatio; cv.height = cv.height * devicePixelRatio;
    c.scale(devicePixelRatio, devicePixelRatio);
    const W = cv.clientWidth, H = cv.height / devicePixelRatio;
    let data = Array.from({ length: 40 }, () => Math.random());
    setInterval(() => {
      data.push(Math.random()); data.shift();
      c.clearRect(0, 0, W, H);
      c.strokeStyle = 'rgba(0,255,136,.12)';
      for (let y = 0; y <= H; y += H / 4) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.beginPath();
      data.forEach((v, i) => { const x = (i / (data.length - 1)) * W, y = H - v * H * .85 - 6; i ? c.lineTo(x, y) : c.moveTo(x, y); });
      c.strokeStyle = color; c.lineWidth = 2; c.shadowColor = color; c.shadowBlur = 8; c.stroke();
      c.lineTo(W, H); c.lineTo(0, H); c.closePath();
      c.fillStyle = color.replace(')', ',.12)').replace('rgb', 'rgba'); c.shadowBlur = 0; c.fill();
    }, reduce ? 1200 : 600);
  }
  lineChart('#trafficChart', 'rgb(0,255,136)');

  /* ---------- Network map (nodes) ---------- */
  (function netMap() {
    const cv = $('#netMap'); if (!cv) return; const c = cv.getContext('2d');
    cv.width = cv.clientWidth; const W = cv.width, H = cv.height;
    const nodes = Array.from({ length: 9 }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 }));
    (function draw() {
      c.clearRect(0, 0, W, H);
      nodes.forEach(n => { n.x += n.vx; n.y += n.vy; if (n.x < 0 || n.x > W) n.vx *= -1; if (n.y < 0 || n.y > H) n.vy *= -1; });
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < 90) { c.strokeStyle = `rgba(25,240,255,${1 - d / 90})`; c.beginPath(); c.moveTo(nodes[i].x, nodes[i].y); c.lineTo(nodes[j].x, nodes[j].y); c.stroke(); }
      }
      nodes.forEach(n => { c.fillStyle = '#00ff88'; c.beginPath(); c.arc(n.x, n.y, 3, 0, 7); c.fill(); });
      reduce ? null : requestAnimationFrame(draw);
    })();
  })();

  /* ---------- Threat level flicker ---------- */
  const levels = [['LOW', 'warn'], ['MODERATE', 'warn'], ['ELEVATED', 'warn']];
  setInterval(() => { const t = $('#threat'); if (t) t.textContent = levels[(Math.random() * levels.length) | 0][0]; }, 4000);

  /* ---------- Password strength meter ---------- */
  const pw = $('#pwInput'), bar = $('#meterBar'), hint = $('#pwHint');
  pw && pw.addEventListener('input', () => {
    const v = pw.value; let s = 0;
    if (v.length >= 8) s++; if (v.length >= 12) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
    const pct = (s / 5) * 100;
    const map = [['#ff3b3b', 'Very weak'], ['#ff7b3b', 'Weak'], ['#ffd166', 'Fair'], ['#9bff66', 'Strong'], ['#00ff88', 'Excellent']];
    const idx = Math.max(0, s - 1);
    bar.style.width = pct + '%'; bar.style.background = map[idx][0]; bar.style.boxShadow = `0 0 10px ${map[idx][0]}`;
    hint.textContent = v ? `${map[idx][1]} — longer passphrases beat complex short ones.` : 'Awaiting input…';
  });

  /* ---------- Sound effects toggle ---------- */
  let sfx = false, audio;
  const sBtn = $('#soundToggle');
  function beep(freq = 440, dur = 0.05) {
    if (!sfx) return;
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = 'square'; o.frequency.value = freq; g.gain.value = 0.03;
    o.connect(g); g.connect(audio.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
    o.stop(audio.currentTime + dur);
  }
  sBtn.addEventListener('click', () => {
    sfx = !sfx; sBtn.textContent = sfx ? '🔊 SFX: ON' : '🔊 SFX: OFF';
    sBtn.setAttribute('aria-pressed', sfx); beep(660);
  });
  document.querySelectorAll('.btn, .chip, .nav-links a').forEach(b => b.addEventListener('mouseenter', () => beep(520, .03)));
  document.querySelectorAll('.btn').forEach(b => b.addEventListener('click', () => beep(780, .06)));

  /* ---------- Theme toggle ---------- */
  const tBtn = $('#themeToggle');
  tBtn.addEventListener('click', () => {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', light ? 'dark' : 'light');
    tBtn.textContent = light ? '🌙 Dark' : '☀️ Light';
  });

  /* ---------- Mobile menu ---------- */
  $('#burger').addEventListener('click', () => $('#navLinks').classList.toggle('show'));
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => $('#navLinks').classList.remove('show')));

  /* ---------- Contact form ---------- */
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const ok = $('#cName').value && $('#cEmail').value.includes('@') && $('#cMsg').value;
    const m = $('#formMsg');
    m.textContent = ok ? '✓ Transmission sent (demo). We\'ll get back to you.' : '✗ Please fill all fields with a valid email.';
    m.style.color = ok ? 'var(--neon)' : '#ff7b7b';
    if (ok) { e.target.reset(); beep(880, .08); }
  });

  /* ---------- Reveal on scroll ---------- */
  const rio = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'none'; rio.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.card, .tool, .news, .widget, .demo, .contact').forEach(el => {
    el.style.opacity = 0; el.style.transform = 'translateY(24px)'; el.style.transition = 'opacity .6s, transform .6s';
    rio.observe(el);
  });

  $('#year').textContent = new Date().getFullYear();
})();
