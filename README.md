# BRENT // Cybersecurity

A cinematic, beginner-friendly cybersecurity learning hub with a futuristic hacker aesthetic — matrix rain, glitch effects, glassmorphism, and a secure admin panel.

🌐 **Live:** https://brentnow26.github.io/brent-cyber/

## Pages
| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, terminal, dashboard widgets, tutorials, tools, news, contact |
| Admin Login | `admin.html` | Futuristic login with show/hide password, remember me, rate limiting, success animation |
| Dashboard | `dashboard.html` | Admin control center, profile, logout, inactivity lock screen |

## Default admin credentials
```
username: admin
password: BrentAdmin@2026
```
> Change it with the backend helper (below). Never ship default creds to production.

## Two authentication modes

**1. Static / local-only (what's deployed on GitHub Pages)**
The login works entirely in the browser. The password is checked against a SHA-256 hash — the plaintext is never in the source. Sessions use `sessionStorage`, with client-side rate limiting (5 attempts → 60s lockout). This is **demo-grade** security: anything client-side is inspectable. Good for learning and demos, not for guarding real secrets.

**2. Real backend (`server/`) — run locally for genuine security**
Node.js + Express + a local JSON store. Passwords are **scrypt**-hashed with a per-user salt and compared in constant time. Sessions are server-side, `httpOnly` cookies. Rate limiting is enforced per-IP on the server. The front-end auto-detects the backend (`/api/login`) and uses it when available, falling back to local auth otherwise.

```bash
cd server
npm install
npm start            # → http://localhost:3000  (serves the whole site + API)
```

Change the admin password:
```bash
cd server
node set-password.js "YourStrongPassword"
# then paste the printed SHA-256 into js/admin.js and js/dashboard.js (ADMIN_HASH)
# for the static build to match.
```

## Features
- 🎨 Dark theme, neon green/blue glow, glassmorphism, animated matrix background
- 🔐 Show/hide password, Remember Me, forgot-password link, loading spinner, error + success animations
- 🛡️ Input validation, password masking, rate limiting, admin-only access, session handling
- ⏱️ Auto lock screen after 2 minutes of inactivity (re-enter password to unlock)
- 📱 Fully responsive · ♿ respects `prefers-reduced-motion`

## Disclaimer
BRENT is for **educational and ethical cybersecurity purposes only**. Unauthorized hacking or illegal activity is strictly prohibited.

## Tech
HTML · CSS · vanilla JavaScript · Node.js + Express (optional backend) · local JSON store

🤖 Generated with [Claude Code](https://claude.com/claude-code)
