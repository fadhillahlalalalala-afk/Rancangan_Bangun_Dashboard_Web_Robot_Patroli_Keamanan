# Hardening VM: SSH dan Lynis (sec-0.2)

Risiko Tugas 1: Risk-02, T01 (pengambilalihan akses), T08/T09 (akses ke server berarti akses ke kunci dan data).

## 1. Urutan kerja yang aman

1. Pastikan Anda sudah punya pasangan kunci SSH dan **sudah berhasil login memakai kunci** sebelum mematikan kata sandi. Jika tidak, Anda terkunci dari VM.
   ```bash
   ssh-keygen -t ed25519 -C "securebot-vm"        # di komputer lokal
   ssh-copy-id -i ~/.ssh/id_ed25519.pub user@<ip-vm>
   ssh -i ~/.ssh/id_ed25519 user@<ip-vm>          # uji dulu
   ```
2. Jalankan Lynis **sebelum** perubahan:
   ```bash
   sudo apt update && sudo apt install -y lynis
   sudo lynis audit system --quick | tee lynis-before.txt
   sudo grep hardening_index /var/log/lynis-report.dat
   ```
3. Terapkan konfigurasi SSH (bagian 2), tindakan hardening (bagian 3).
4. Jalankan Lynis **sesudah** dan simpan `lynis-after.txt`. Target indeks minimal 70.

## 2. Konfigurasi SSH

Buat berkas `/etc/ssh/sshd_config.d/00-hardening.conf`. Awalan `00-` penting: sshd memakai nilai pertama yang ditemukan, dan di Ubuntu cloud image berkas `50-cloud-init.conf` bisa menyalakan kembali `PasswordAuthentication`.

```
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
PermitEmptyPasswords no
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
AllowTcpForwarding no
ClientAliveInterval 300
ClientAliveCountMax 2
AllowUsers <nama-user-anda>
```

Terapkan dan verifikasi:

```bash
sudo sshd -t && sudo systemctl reload ssh
sudo sshd -T | grep -E 'passwordauthentication|permitrootlogin'
```

Keluaran yang diharapkan (salin ke bukti):

```
permitrootlogin no
passwordauthentication no
```

Uji negatif (simpan keluarannya):

```bash
ssh -o PubkeyAuthentication=no user@<ip-vm>     # harus: Permission denied (publickey)
ssh root@<ip-vm>                                # harus ditolak
```

## 3. Tindakan hardening tambahan (untuk menaikkan indeks Lynis)

```bash
# Pembaruan otomatis dan paket keamanan
sudo apt install -y unattended-upgrades apt-listchanges fail2ban ufw auditd libpam-pwquality \
  apparmor-utils acct sysstat debsums apt-show-versions
sudo dpkg-reconfigure -plow unattended-upgrades

# Firewall: hanya SSH (dan port aplikasi bila diperlukan)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw enable

# Banner dan sysctl dasar
sudo tee /etc/sysctl.d/99-hardening.conf >/dev/null <<'EOF'
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.tcp_syncookies = 1
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
fs.suid_dumpable = 0
EOF
sudo sysctl --system

# Matikan layanan yang tidak dipakai (cek dulu dengan: systemctl list-unit-files --state=enabled)
sudo systemctl disable --now <layanan-tidak-dipakai>
```

Setelah itu jalankan ulang Lynis, buka bagian "Suggestions" pada `lynis-after.txt`, dan kerjakan saran yang relevan sampai indeks ≥ 70.

## 4. Hasil

| Pemeriksaan | Sebelum | Sesudah | Bukti |
|---|---|---|---|
| Indeks Lynis | _isi_ | _isi_ (≥ 70) | `lynis-before.txt`, `lynis-after.txt` |
| `permitrootlogin` | _isi_ | no | `sshd -T` |
| `passwordauthentication` | _isi_ | no | `sshd -T` |
| Login kata sandi/root ditolak | - | ☐ | uji negatif |
| Layanan app berjalan non-root | - | ☐ | lihat `container-hardening.md` |
