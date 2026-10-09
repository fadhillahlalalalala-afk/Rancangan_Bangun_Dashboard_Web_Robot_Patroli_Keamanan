'use strict';
// Demo satu perintah: menjalankan server nyata + robot + penyerang. Semua data sintetis.
const { once } = require('node:events');
const { createApp } = require('../src/app');
const { RobotClient } = require('../src/robotClient');
const { generateKey } = require('../src/eventCrypto');
const { hashPassword } = require('../src/passwordHash');

const step = (n, t) => console.log(`\n[${n}] ${t}`);
const post = (url, body, token) => fetch(url, {
  method: 'POST', headers: { 'content-type': 'application/json', ...(token && { authorization: 'Bearer ' + token }) },
  body: JSON.stringify(body),
});

(async () => {
  const eventKey = generateKey(), cmdKey = generateKey();
  const server = createApp({ eventKey, cmdKey, adminHash: hashPassword('sandi-sintetis-123') });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const robot = new RobotClient({ baseUrl: base, deviceId: 'robot-01', eventKey, cmdKey });

  step(1, 'Login admin (komponen: scrypt)');
  console.log('  password salah ->', (await post(base + '/api/login', { username: 'admin', password: 'salah-salah' })).status);
  const login = await post(base + '/api/login', { username: 'admin', password: 'sandi-sintetis-123' });
  const { token } = await login.json();
  console.log('  password benar ->', login.status, '(token sesi diterima, panjang', token.length, 'hex)');

  step(2, 'Robot mengirim kejadian terenkripsi (komponen: AES-256-GCM)');
  const r1 = await robot.sendEvent({ type: 'gerak', zone: 'B', dir: 'KIRI' });
  console.log('  yang terlihat penyadap :', JSON.stringify({ ...r1.envelope, ct: r1.envelope.ct.slice(0, 24) + '...' }));
  console.log('  respons server         :', r1.status);

  step(3, 'Penyerang mengirim ulang paket yang sama (replay)');
  const rp = await robot.sendRaw(r1.envelope);
  console.log('  respons server         :', rp.status, rp.body.error);

  step(4, 'Penyerang mengubah satu byte ciphertext');
  const ct = Buffer.from(r1.envelope.ct, 'base64'); ct[0] ^= 1;
  const tp = await robot.sendRaw({ ...r1.envelope, ct: ct.toString('base64') });
  console.log('  respons server         :', tp.status, tp.body.error);

  step(5, 'Admin mengirim perintah, robot memverifikasi (komponen: HMAC-SHA256)');
  await post(base + '/api/commands', { command: 'ALARM_OFF' }, token);
  console.log('  robot menerima perintah:', await robot.pollCommand(), '(MAC valid)');

  step(6, 'Dashboard membaca riwayat (hanya dengan token)');
  const list = await (await fetch(base + '/api/events', { headers: { authorization: 'Bearer ' + token } })).json();
  console.log('  jumlah kejadian tersimpan:', list.length, '->', JSON.stringify(list[0].event));

  server.closeAllConnections(); server.close();
})();
