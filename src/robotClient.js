'use strict';
// Sisi robot (disimulasikan di Node): mengenkripsi kejadian dan memverifikasi perintah.
const { encryptEvent } = require('./eventCrypto');
const { verifyCommand } = require('./commandMac');

class RobotClient {
  constructor({ baseUrl, deviceId, eventKey, cmdKey }) {
    Object.assign(this, { baseUrl, deviceId, eventKey, cmdKey, counter: 0, lastCmd: 0 });
  }
  async sendRaw(envelope) {
    const r = await fetch(this.baseUrl + '/api/events', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(envelope),
    });
    return { status: r.status, body: await r.json() };
  }
  async sendEvent(event) {
    const envelope = encryptEvent(this.eventKey, this.deviceId, ++this.counter, event);
    return { envelope, ...(await this.sendRaw(envelope)) };
  }
  async pollCommand() {
    const r = await fetch(this.baseUrl + '/api/commands/next');
    if (r.status === 204) return null;
    const msg = await r.json();
    if (!verifyCommand(this.cmdKey, msg)) throw new Error('MAC perintah tidak valid');
    if (msg.counter <= this.lastCmd) throw new Error('replay perintah');
    this.lastCmd = msg.counter;
    return msg.command;
  }
}
module.exports = { RobotClient };
