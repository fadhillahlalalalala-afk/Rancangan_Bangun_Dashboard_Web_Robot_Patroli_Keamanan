'use strict';
// Komponen 2: enkripsi + autentikasi data kejadian robot -> server (AES-256-GCM).
const crypto = require('node:crypto');

const ALG = 'aes-256-gcm', KEY_LEN = 32, IV_LEN = 12, TAG_LEN = 16;

function generateKey() { return crypto.randomBytes(KEY_LEN); } // CSPRNG

function checkKey(key) {
  if (!Buffer.isBuffer(key) || key.length !== KEY_LEN) {
    throw new RangeError('kunci harus Buffer 32 byte (AES-256)');
  }
}

// counter dimasukkan ke dalam plaintext terenkripsi -> dilindungi tag GCM.
function encryptEvent(key, deviceId, counter, event) {
  checkKey(key);
  if (!Number.isSafeInteger(counter) || counter < 1) throw new RangeError('counter harus integer >= 1');
  const iv = crypto.randomBytes(IV_LEN); // IV acak unik per pesan
  const cipher = crypto.createCipheriv(ALG, key, iv, { authTagLength: TAG_LEN });
  cipher.setAAD(Buffer.from(deviceId, 'utf8')); // deviceId diautentikasi, tidak dienkripsi
  const plaintext = Buffer.from(JSON.stringify({ counter, event }), 'utf8');
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  // base64 hanya ENCODING agar aman dikirim lewat teks/JSON, bukan perlindungan.
  return {
    v: 1, device: deviceId,
    iv: iv.toString('base64'), ct: ct.toString('base64'), tag: cipher.getAuthTag().toString('base64'),
  };
}

class EventReceiver {
  constructor(key) { checkKey(key); this.key = key; this.lastCounter = new Map(); }

  open(env) {
    const iv = Buffer.from(env.iv, 'base64');
    const tag = Buffer.from(env.tag, 'base64');
    if (iv.length !== IV_LEN || tag.length !== TAG_LEN) throw new Error('format paket tidak valid');
    const d = crypto.createDecipheriv(ALG, this.key, iv, { authTagLength: TAG_LEN });
    d.setAAD(Buffer.from(env.device, 'utf8'));
    d.setAuthTag(tag);
    const pt = Buffer.concat([d.update(Buffer.from(env.ct, 'base64')), d.final()]); // throw jika tag salah
    const { counter, event } = JSON.parse(pt.toString('utf8'));
    const last = this.lastCounter.get(env.device) ?? 0;
    if (counter <= last) throw new Error('replay terdeteksi: counter sudah dipakai');
    this.lastCounter.set(env.device, counter); // diperbarui hanya setelah lolos semua cek
    return event;
  }
}

module.exports = { generateKey, encryptEvent, EventReceiver };
