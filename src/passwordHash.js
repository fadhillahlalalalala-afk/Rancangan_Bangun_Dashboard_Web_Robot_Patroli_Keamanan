'use strict';
// Komponen 1: penyimpanan password admin dashboard (scrypt + salt acak).
const crypto = require('node:crypto');

const N = 16384, R = 8, P = 1, KEYLEN = 32, SALT_LEN = 16, MIN_LEN = 8;

function hashPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_LEN) {
    throw new RangeError(`password minimal ${MIN_LEN} karakter`);
  }
  const salt = crypto.randomBytes(SALT_LEN); // CSPRNG
  const dk = crypto.scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return ['scrypt', N, R, P, salt.toString('base64'), dk.toString('base64')].join('$');
}

function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const salt = Buffer.from(saltB64, 'base64');
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(password, salt, expected.length, { N: +n, r: +r, p: +p });
  return crypto.timingSafeEqual(actual, expected); // perbandingan waktu-konstan
}

module.exports = { hashPassword, verifyPassword };
