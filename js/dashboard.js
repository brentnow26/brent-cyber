/* ===== BRENT // Admin dashboard ===== */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const ADMIN_HASH = '66d80ce46dd59f5db3f5636ccf770d69bf2a79e908839622949c72b505b44dfb';
  const IDLE_MS = 2 * 60 * 1000; // lock after 2 minutes idle

  /* ---- session guard ---- */
  function getSession() {
    try { return JSON.parse(sessionStorage.getItem('brent_admin_session') || localStorage.getItem('brent_admin_session')); }
    catch { return null; }
  }
  const session = getSession();
  if (!session || !session.user) { location.replace('admin.html'); return; }
  $('#whoName').textContent = session.user;
  $('#welcomeName').textContent = session.user;
  $('#sessMode').textContent = session.mode || 'local';

  /* ---- logout ---- */
  async function logout() {
    try { await fetch('/api/logout', { method: 'POST', credentials: 'include' }); } catch {}
    sessionStorage.removeItem('brent_admin_session');
    localStorage.removeItem('brent_admin_session');
    location.replace('admin.html');
  }
  $('#logoutBtn').addEventListener('click', logout);

  /* ---- count-up KPIs ---- */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count; let n = 0;
    const step = () => { n += Math.ceil(target / 35); if (n >= target) n = target; el.textContent = n; if (n < target) requestAnimationFrame(step); };
    step();
  });

  /* ---- live security log ---- */
  const events = [
    'Login success — admin', 'Firewall blocked 12 packets', 'New device fingerprint logged',
    'Port scan detected & dropped', 'Backup snapshot verified', 'TLS handshake renegotiated',
    'Failed SSH from 203.0.113.9 blocked', 'Rate-limit triggered on /api', 'Audit log exported'
  ];
  const logEl = $('#liveLog');
  function pushLog(msg) {
    const li = document.createElement('li');
    const t = new Date().toLocaleTimeString();
    li.innerHTML = `<span class="t">${t}</span> ${msg}`;
    logEl.prepend(li);
    while (logEl.children.length > 8) logEl.lastChild.remove();
  }
  for (let i = 0; i < 5; i++) pushLog(events[(Math.random() * events.length) | 0]);
  setInterval(() => pushLog(events[(Math.random() * events.length) | 0]), 4000);

  /* ---- inactivity lock screen ---- */
  const lock = $('#lockScreen');
  let idleTimer;
  function resetIdle() {
    clearTimeout(idleTimer);
    if (!lock.classList.contains('show')) idleTimer = setTimeout(engageLock, IDLE_MS);
  }
  function engageLock() {
    lock.classList.add('show'); lock.setAttribute('aria-hidden', 'false');
    $('#lockPw').focus();
  }
  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(ev =>
    addEventListener(ev, resetIdle, { passive: true }));
  resetIdle();

  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  async function unlock() {
    const pw = $('#lockPw').value;
    let ok = false;
    try {
      const r = await fetch('/api/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ password: pw })
      });
      if (r.ok) ok = (await r.json()).ok === true; else throw 0;
    } catch { ok = (await sha256(pw)) === ADMIN_HASH; }
    if (ok) {
      lock.classList.remove('show'); lock.setAttribute('aria-hidden', 'true');
      $('#lockPw').value = ''; $('#lockMsg').textContent = ''; resetIdle();
    } else {
      $('#lockMsg').textContent = '✗ Incorrect password.';
      $('#lockPw').value = '';
    }
  }
  $('#unlockBtn').addEventListener('click', unlock);
  $('#lockPw').addEventListener('keydown', (e) => { if (e.key === 'Enter') unlock(); });
})();
