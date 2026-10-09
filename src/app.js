'use strict';
// Backend web SecureBot: menghubungkan komponen kriptografi ke produk.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { verifyPassword } = require('./passwordHash');
const { EventReceiver } = require('./eventCrypto');
const { signCommand } = require('./commandMac');

const MAX_BODY = 16 * 1024;            // batas ukuran body (byte)
const SESSION_MS = 15 * 60 * 1000;     // sesi 15 menit
const COMMANDS = ['ALARM_ON', 'ALARM_OFF', 'PATROL_PAUSE', 'PATROL_RESUME'];
const WEB = path.join(__dirname, '..', 'web');

function createApp({ eventKey, cmdKey, adminHash }) {
  const receiver = new EventReceiver(eventKey);
  const events = [], cmdQueue = [], sessions = new Map();
  let cmdCounter = 0;

  const send = (res, code, obj) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
  };
  const readJson = (req) => new Promise((resolve, reject) => {
    let size = 0, tooBig = false; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > MAX_BODY) tooBig = true; else chunks.push(c); });
    req.on('end', () => {
      if (tooBig) return reject({ code: 413, msg: 'body terlalu besar' });
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject({ code: 400, msg: 'JSON tidak valid' }); }
    });
  });
  const authed = (req) => {
    const m = /^Bearer ([0-9a-f]{64})$/.exec(req.headers.authorization || '');
    if (!m) return false;
    const s = sessions.get(m[1]);
    if (!s || s.exp < Date.now()) { sessions.delete(m[1]); return false; }
    return true;
  };
  const page = (res, file) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(WEB, file)));
  };

  return http.createServer(async (req, res) => {
    try {
      const { method, url } = req;
      if (method === 'GET' && url === '/') return page(res, 'dashboard.html');
      if (method === 'GET' && url === '/simulator') return page(res, 'simulator.html');

      if (method === 'POST' && url === '/api/login') {
        const b = await readJson(req);
        // verifikasi selalu dijalankan agar waktu respons tidak membocorkan username valid
        const ok = verifyPassword(String(b.password ?? ''), adminHash) && b.username === 'admin';
        if (!ok) return send(res, 401, { error: 'login gagal' });
        const token = crypto.randomBytes(32).toString('hex'); // CSPRNG
        sessions.set(token, { exp: Date.now() + SESSION_MS });
        return send(res, 200, { token });
      }
      if (method === 'POST' && url === '/api/events') {          // dari robot
        const env = await readJson(req);
        let event;
        try { event = receiver.open(env); }
        catch (e) {
          return /replay/.test(e.message) ? send(res, 409, { error: 'replay ditolak' })
                                          : send(res, 400, { error: 'paket ditolak' });
        }
        events.push({ at: new Date().toISOString(), device: env.device, event });
        return send(res, 201, { ok: true });
      }
      if (method === 'GET' && url === '/api/events') {
        if (!authed(req)) return send(res, 401, { error: 'butuh login' });
        return send(res, 200, events);
      }
      if (method === 'POST' && url === '/api/commands') {        // dari admin
        if (!authed(req)) return send(res, 401, { error: 'butuh login' });
        const { command } = await readJson(req);
        if (!COMMANDS.includes(command)) return send(res, 400, { error: 'perintah tidak dikenal' });
        const msg = signCommand(cmdKey, command, ++cmdCounter);
        cmdQueue.push(msg);
        return send(res, 201, msg);
      }
      if (method === 'GET' && url === '/api/commands/next') {    // diambil robot
        const msg = cmdQueue.shift();
        if (!msg) { res.writeHead(204); return res.end(); }
        return send(res, 200, msg);
      }
      return send(res, 404, { error: 'tidak ditemukan' });
    } catch (e) {
      return send(res, e.code || 500, { error: e.msg || 'kesalahan server' });
    }
  });
}

module.exports = { createApp };
