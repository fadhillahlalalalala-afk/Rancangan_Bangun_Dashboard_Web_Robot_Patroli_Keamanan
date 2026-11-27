# Dashboard Web Robot Patroli Keamanan — Modul Kriptografi (v0.2)

Modul `kripto/` melindungi kerahasiaan dan integritas data telemetri/log robot patroli dengan **AES-256-GCM** (pustaka `cryptography`). Semua data pada contoh bersifat **sintetis**.

Dokumen keputusan desain: [`KEPUTUSAN.md`](KEPUTUSAN.md) · Log AI: [`AI_LOG.md`](AI_LOG.md)

## Menjalankan
```bash
pip install -r requirements.txt

# 1) Bangkitkan kunci DI LUAR repository
python -m kripto.keygen ~/.config/patroli/kunci_v1.key k1
export PATROLI_KEY_FILE=~/.config/patroli/kunci_v1.key

# 2) Uji (16 skenario)
python -m unittest discover -v

# 3) Demo
python demo.py
```

## Memakai di backend dashboard
```python
from kripto import load_key, encrypt_record, decrypt_record
kid, key = load_key()                      # dari $PATROLI_KEY_FILE
env = encrypt_record(key, kid, "ROBOT-01", "telemetri", {"lat": -6.2, "baterai": 80})
data = decrypt_record(key, env, expected_robot_id="ROBOT-01", expected_jenis="telemetri")
```
Tangkap `DecryptionError` / `ValidationError` / `KeyError_` dan **tolak** permintaan (gagal tertutup).

## Struktur
```
kripto/aead.py     # encrypt_record, decrypt_record, load_key
kripto/keygen.py   # pembangkit kunci CSPRNG ke luar repo
tests/test_aead.py # 16 uji
demo.py            # demo ±3 menit
```

## Pengumpulan
`git tag v0.2 && git push origin v0.2` — jangan memindahkan tag setelah tenggat.
