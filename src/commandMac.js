'use strict';
// Komponen 3: autentikasi perintah kontrol robot (HMAC-SHA256).
const crypto = require('node:crypto');

function tag(key, command, counter) {
  return crypto.createHmac('sha256', key).update(`${counter}|${command}`, 'utf8').digest();
}

function signCommand(key, command, counter) {
  if (!Buffer.isBuffer(key) || key.length < 32) throw new RangeError('kunci HMAC minimal 32 byte');
  return { command, counter, mac: tag(key, command, counter).toString('hex') };
}

function verifyCommand(key, msg) {
  const expected = tag(key, msg.command, msg.counter);
  const given = Buffer.from(String(msg.mac), 'hex');
  if (given.length !== expected.length) return false; // timingSafeEqual butuh panjang sama
  return crypto.timingSafeEqual(given, expected);
}

module.exports = { signCommand, verifyCommand };
