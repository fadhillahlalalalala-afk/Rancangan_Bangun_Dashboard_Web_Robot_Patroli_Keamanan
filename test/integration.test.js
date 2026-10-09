'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createApp } = require('../src/app');
const { RobotClient } = require('../src/robotClient');
const { generateKey } = require('../src/eventCrypto');
const { hashPassword } = require('../src/passwordHash');

let server, base, robot, token;
const post = (path, body, tk) => fetch(base + path, {
  method: 'POST', headers: { 'content-type': 'application/json', ...(tk && { authorization: 'Bearer ' + tk }) },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

test.before(async () => {
  const eventKey = generateKey(), cmdKey = generateKey();
  server = createApp({ eventKey, cmdKey, adminHash: hashPassword('sandi-sintetis-123') });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
  robot = new RobotClient({ baseUrl: base, deviceId: 'robot-it', eventKey, cmdKey });
});
test.after(() => { server.closeAllConnections(); server.close(); });

test('T11 login admin benar mendapat token 64 hex', async () => {
  const r = await post('/api/login', { username: 'admin', password: 'sandi-sintetis-123' });
  assert.equal(r.status, 200);
  token = (await r.json()).token;
  assert.match(token, /^[0-9a-f]{64}$/);
});

test('T12 [negatif] login password salah ditolak 401', async () => {
  assert.equal((await post('/api/login', { username: 'admin', password: 'salah-salah' })).status, 401);
});

test('T13 [negatif] riwayat tanpa token ditolak 401', async () => {
  assert.equal((await fetch(base + '/api/events')).status, 401);
});

test('T14 kejadian terenkripsi dari robot diterima dan tampil di dashboard', async () => {
  const r = await robot.sendEvent({ type: 'gerak', zone: 'A', dir: 'TENGAH' });
  assert.equal(r.status, 201);
  const list = await (await fetch(base + '/api/events', { headers: { authorization: 'Bearer ' + token } })).json();
  assert.deepEqual(list.at(-1).event, { type: 'gerak', zone: 'A', dir: 'TENGAH' });
});

test('T15 [negatif] replay lewat HTTP ditolak 409', async () => {
  const r = await robot.sendEvent({ type: 'getar' });
  assert.equal((await robot.sendRaw(r.envelope)).status, 409);
});

test('T16 [batas] body 20 KB (> batas 16 KB) ditolak 413', async () => {
  assert.equal((await post('/api/login', JSON.stringify({ password: 'a'.repeat(20000) }))).status, 413);
});

test('T17 perintah: tanpa token 401; dengan token diterima robot dengan MAC valid', async () => {
  assert.equal((await post('/api/commands', { command: 'ALARM_OFF' })).status, 401);
  assert.equal((await post('/api/commands', { command: 'ALARM_OFF' }, token)).status, 201);
  assert.equal(await robot.pollCommand(), 'ALARM_OFF');
});
