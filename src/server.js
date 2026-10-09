'use strict';
// Menjalankan produk. Semua rahasia dibaca dari variabel lingkungan (lihat README).
const { createApp } = require('./app');
const { hashPassword } = require('./passwordHash');

const need = (n) => {
  const v = process.env[n];
  if (!v) { console.error(`Variabel ${n} belum diisi. Lihat README bagian 4.`); process.exit(1); }
  return v;
};
const eventKey = Buffer.from(need('SECUREBOT_EVENT_KEY'), 'base64');
const cmdKey = Buffer.from(need('SECUREBOT_CMD_KEY'), 'base64');
const adminHash = hashPassword(need('SECUREBOT_ADMIN_PASSWORD'));

const port = Number(process.env.PORT || 3000);
createApp({ eventKey, cmdKey, adminHash }).listen(port, '127.0.0.1', () =>
  console.log(`SecureBot berjalan di http://127.0.0.1:${port}`));
