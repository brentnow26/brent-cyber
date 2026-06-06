/* ===== BRENT // Admin login ===== */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);

  /* Default local credentials (demo). Password = "BrentAdmin@2026".
     Only the SHA-256 hash is stored client-side, never the plaintext.
     When the Express backend is running it authenticates there instead. */
  const ADMIN_USER = 'admin';
  const ADMIN_HASH = '66d80ce46dd59f5db3f5636ccf770d69bf2a79e908839622949c72b505b44dfb';

  const RL_KEY = 'brent_admin_rl';   // rate-limit state
  const MAX_ATTEMPTS = 5;
  const LOCK_MS = 60 * 1000;         // 60s lockout after max attempts

  /* ---- typing terminal header ---- */
  const lines = ['> initializing secure shell...', '> awaiting admin credentials_'];
  const term = $('#authTerm'); let li = 0, ci = 0;
  (function type() {
    if (li >= lines.length) return;
    term.textContent = lines.slice(0, li).join('\n') + (li ? '\n' : '') + lines[li].slice(0, ci++);
    if (ci > lines[li].length) { li++; ci = 0; setTimeout(type, 400); }
    else setTimeout(type, 38);
  })();

  /* ---- show / hide password ---- */
  $('#togglePw').addEventListener('click', () => {
    const p = $('#password'), b = $('#togglePw');
    const show = p.type === 'password';
    p.type = show ? 'text' : 'password';
    b.textContent = show ? '🙈' : '👁';
    b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });

  $('#forgotLink').addEventListener('click', (e) => {
    e.preventDefault();
    showMsg('Local admin: reset via server/data/users.json (see README).', 'err');
  });

  /* ---- restore remembered username ---- */
  const remembered = localStorage.getItem('brent_admin_user');
  if (remembered) { $('#username').value = remembered; $('#remember').checked = true; }

  /* ---- rate limiting ---- */
  function rlState() { try { return JSON.parse(localStorage.getItem(RL_KEY)) || { n: 0, until: 0 }; } catch { return { n: 0, until: 0 }; } }
  function lockedFor() { const s = rlState(); return s.until > Date.now() ? Math.ceil((s.until - Date.now()) / 1000) : 0; }
  function recordFail() {
    const s = rlState(); s.n += 1;
    if (s.n >= MAX_ATTEMPTS) { s.until = Date.now() + LOCK_MS; s.n = 0; }
    localStorage.setItem(RL_KEY, JSON.stringify(s));
  }
  function clearRL() { localStorage.removeItem(RL_KEY); }

  function showMsg(text, kind) {
    const m = $('#authMsg'); m.textContent = text;
    m.className = 'auth-msg ' + (kind || '');
  }

  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* Try the Express backend first; fall back to local hash check (static host). */
  async function authenticate(user, pass) {
    try {
      const r = await fetch('/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: user, password: pass })
      });
      if (r.status === 429) return { ok: false, msg: 'Too many attempts. Try again later.' };
      const data = await r.json().catch(() => ({}));
      return { ok: r.ok && data.ok === true, msg: data.message, server: true };
    } catch {
      // No backend (e.g. GitHub Pages) -> local-only authentication
      const hash = await sha256(pass);
      return { ok: user === ADMIN_USER && hash === ADMIN_HASH, local: true };
    }
  }

  /* ---- submit ---- */
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const wait = lockedFor();
    if (wait) { showMsg(`🔒 Locked. Wait ${wait}s before retrying.`, 'err'); return; }

    const user = $('#username').value.trim();
    const pass = $('#password').value;

    // basic input validation
    if (!user || !pass) { showMsg('✗ Enter both username and password.', 'err'); return; }
    if (user.length > 64 || pass.length > 128) { showMsg('✗ Input too long.', 'err'); return; }

    const btn = $('#loginBtn'); btn.classList.add('loading'); showMsg('', '');
    const res = await authenticate(user, pass);
    await new Promise(r => setTimeout(r, 700)); // let the spinner breathe

    if (res.ok) {
      clearRL();
      if ($('#remember').checked) localStorage.setItem('brent_admin_user', user);
      else localStorage.removeItem('brent_admin_user');
      // create a lightweight session marker for the dashboard guard
      const session = { user, t: Date.now(), mode: res.server ? 'server' : 'local' };
      sessionStorage.setItem('brent_admin_session', JSON.stringify(session));
      localStorage.setItem('brent_admin_session', JSON.stringify(session));
      showMsg('✓ Access granted. Redirecting…', 'ok');
      const ov = $('#successOverlay'); ov.classList.add('show');
      setTimeout(() => { location.href = 'dashboard.html'; }, 1400);
    } else {
      btn.classList.remove('loading');
      if (res.msg && /too many/i.test(res.msg)) { showMsg('🔒 ' + res.msg, 'err'); return; }
      recordFail();
      const left = MAX_ATTEMPTS - rlState().n;
      const now = lockedFor();
      showMsg(now ? `🔒 Too many failed attempts. Locked ${now}s.`
                  : `✗ Invalid credentials. ${left} attempt${left === 1 ? '' : 's'} left.`, 'err');
      $('#password').value = '';
    }
  });
})();
