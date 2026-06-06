/* ===== BRENT // Admin auth backend =====
 * Express + local JSON store. Passwords stored as scrypt(salt, password).
 * Provides server-side sessions, rate limiting, and admin-only access.
 * Run:  npm install && npm start   (http://localhost:3000)
 */
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');               // serves the static site
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

app.use(express.json({ limit: '16kb' }));
app.use(session({
  name: 'brent.sid',
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 30 } // 30 min
}));

/* ---- helpers ---- */
const loadUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
function verifyPassword(user, password) {
  const rec = loadUsers()[user];
  if (!rec) return false;
  const test = crypto.scryptSync(password, rec.salt, 64).toString('hex');
  // constant-time comparison
  const a = Buffer.from(test, 'hex'), b = Buffer.from(rec.hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ---- rate limiting (per IP, in-memory) ---- */
const MAX = 5, WINDOW = 60 * 1000;
const buckets = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const b = buckets.get(ip) || { n: 0, until: 0 };
  if (b.until > now) return true;
  buckets.set(ip, b);
  return false;
}
function recordFail(ip) {
  const now = Date.now();
  const b = buckets.get(ip) || { n: 0, until: 0 };
  b.n += 1;
  if (b.n >= MAX) { b.until = now + WINDOW; b.n = 0; }
  buckets.set(ip, b);
}
const resetBucket = (ip) => buckets.delete(ip);

/* ---- admin-only guard ---- */
function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.role === 'admin') return next();
  res.status(401).json({ ok: false, message: 'Admin access required.' });
}

/* ---- routes ---- */
app.post('/api/login', (req, res) => {
  const ip = req.ip;
  if (rateLimited(ip)) return res.status(429).json({ ok: false, message: 'Too many attempts. Try again later.' });

  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password)
    return res.status(400).json({ ok: false, message: 'Username and password required.' });
  if (username.length > 64 || password.length > 128)
    return res.status(400).json({ ok: false, message: 'Input too long.' });

  const rec = loadUsers()[username];
  if (rec && rec.role === 'admin' && verifyPassword(username, password)) {
    resetBucket(ip);
    req.session.user = username;
    req.session.role = 'admin';
    return res.json({ ok: true, user: username });
  }
  recordFail(ip);
  res.status(401).json({ ok: false, message: 'Invalid credentials.' });
});

// re-verify current admin's password (used by the lock screen)
app.post('/api/verify', requireAdmin, (req, res) => {
  const { password } = req.body || {};
  res.json({ ok: verifyPassword(req.session.user, String(password || '')) });
});

app.get('/api/session', (req, res) => {
  if (req.session && req.session.user) res.json({ ok: true, user: req.session.user, role: req.session.role });
  else res.status(401).json({ ok: false });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => { res.clearCookie('brent.sid'); res.json({ ok: true }); });
});

// serve the static front-end
app.use(express.static(ROOT));

app.listen(PORT, () => {
  console.log(`\n  BRENT admin backend → http://localhost:${PORT}`);
  console.log('  Default login: admin / BrentAdmin@2026  (change with: npm run set-password)\n');
});
