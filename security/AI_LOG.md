# AI Development & Assistance Log

## **Log Entri [sec-0.1] - Perancangan Kontrol Keamanan & Pemetaan Tugas**
* **Tanggal:** 13 Oktober 2026
* **Topik:** 
  1. Pemetaan risiko keamanan dari diagram DFD (Tugas 1) ke dalam kontrol teknis konkret untuk **Tugas 2** (Hardening, Autentikasi, Vulnerability Scanning) dan **Tugas 3** (Data Classification, Secrets Management, Backup).

  2. Penyusunan struktur format file Markdown untuk dokumentasi keamanan (`risk-controls.md`, `data-classification.md`, `secrets.md`, `backup-restore.md`).


* **Bantuan AI yang Digunakan:** 
  * Membantu menstrukturkan tabel matriks kontrol akses (RBAC), parameter SSH hardening, dan *container hardening* agar sesuai dengan rubrik penilaian Tugas 2 (skor Lynis, non-root user, image scanning tanpa kerentanan critical).

  * Membantu merumuskan format klasifikasi data dan manajemen secrets yang selaras dengan pemeriksaan Checkpoint 2 Tugas 3.

* **Keputusan Teknis / Tindak Lanjut:**
  * Menetapkan penggunaan fungsi *hash* lambat **Argon2id** / 
  **Bcrypt** untuk penyimpanan kata sandi.

  * Memastikan setiap kontrol memiliki penanda referensi (`sec-0.2`) guna memudahkan auditor memeriksa keterkaitan antara register risiko dan implementasi nyata di repositori.