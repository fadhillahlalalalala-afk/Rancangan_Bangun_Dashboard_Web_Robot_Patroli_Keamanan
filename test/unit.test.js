'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { hashPassword, verifyPassword } = require('../src/passwordHash');
const { generateKey, encryptEvent, EventReceiver } = require('../src/eventCrypto');
const { signCommand, verifyCommand } = require('../src/commandMac');

const DEV = 'robot-01';
const evt = { type: 'gerak', zone: 'B', dir: 'KIRI' }; // data sintetis

test('T1 password benar diterima', () => {
  const h = hashPassword('sandi-sintetis-123');
  assert.equal(verifyPassword('sandi-sintetis-123', h), true);
});

test('T2 [negatif] password salah ditolak', () => {
  const h = hashPassword('sandi-sintetis-123');
  assert.equal(verifyPassword('sandi-salah-000', h), false);
});

test('T3 salt acak: hash password sama menghasilkan keluaran berbeda', () => {
  assert.notEqual(hashPassword('sandi-sintetis-123'), hashPassword('sandi-sintetis-123'));
});

test('T4 [batas] password 7 karakter ditolak, 8 karakter diterima', () => {
  assert.throws(() => hashPassword('1234567'), RangeError);
  assert.doesNotThrow(() => hashPassword('12345678'));
});

test('T5 enkripsi lalu dekripsi mengembalikan data semula', () => {
  const key = generateKey();
  const rx = new EventReceiver(key);
  assert.deepEqual(rx.open(encryptEvent(key, DEV, 1, evt)), evt);
});

test('T6 [negatif] ciphertext yang diubah satu byte ditolak', () => {
  const key = generateKey();
  const rx = new EventReceiver(key);
  const env = encryptEvent(key, DEV, 1, evt);
  const ct = Buffer.from(env.ct, 'base64'); ct[0] ^= 0x01;
  assert.throws(() => rx.open({ ...env, ct: ct.toString('base64') }));
});

test('T7 [negatif] deviceId (AAD) dipalsukan ditolak', () => {
  const key = generateKey();
  const rx = new EventReceiver(key);
  const env = encryptEvent(key, DEV, 1, evt);
  assert.throws(() => rx.open({ ...env, device: 'robot-99' }));
});

test('T8 [negatif] replay paket yang sama ditolak', () => {
  const key = generateKey();
  const rx = new EventReceiver(key);
  const env = encryptEvent(key, DEV, 1, evt);
  rx.open(env);
  assert.throws(() => rx.open(env), /replay/);
});

test('T9 [batas] kunci bukan 32 byte dan counter 0 ditolak', () => {
  assert.throws(() => encryptEvent(crypto.randomBytes(16), DEV, 1, evt), RangeError);
  assert.throws(() => encryptEvent(generateKey(), DEV, 0, evt), RangeError);
});

test('T10 HMAC: perintah asli valid, perintah diubah tidak valid', () => {
  const key = generateKey();
  const msg = signCommand(key, 'ALARM_OFF', 7);
  assert.equal(verifyCommand(key, msg), true);
  assert.equal(verifyCommand(key, { ...msg, command: 'MOVE_FORWARD' }), false);
});

test('T18 IV tidak dipakai ulang: dua enkripsi data sama menghasilkan iv dan ct berbeda', () => {
  const key = generateKey();
  const a = encryptEvent(key, DEV, 1, evt), b = encryptEvent(key, DEV, 2, evt);
  assert.notEqual(a.iv, b.iv);
  assert.notEqual(a.ct, b.ct);
});
