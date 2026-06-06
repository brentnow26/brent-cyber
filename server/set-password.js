/* Change the admin password.
 * Usage:  node set-password.js "NewStrongPassword"
 * Updates server/data/users.json (scrypt) and prints the SHA-256 hash
 * to paste into js/admin.js + js/dashboard.js for the static deploy.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const pw = process.argv[2];
if (!pw) { console.error('Usage: node set-password.js "NewPassword"'); process.exit(1); }

const file = path.join(__dirname, 'data', 'users.json');
const users = JSON.parse(fs.readFileSync(file, 'utf8'));
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
users.admin = { salt, hash, role: 'admin' };
fs.writeFileSync(file, JSON.stringify(users, null, 2) + '\n');

const sha = crypto.createHash('sha256').update(pw).digest('hex');
console.log('\n✓ Backend password updated (server/data/users.json).');
console.log('\nFor the static (GitHub Pages) build, set ADMIN_HASH to:\n');
console.log('  ' + sha + '\n');
console.log('  in  js/admin.js  AND  js/dashboard.js\n');
