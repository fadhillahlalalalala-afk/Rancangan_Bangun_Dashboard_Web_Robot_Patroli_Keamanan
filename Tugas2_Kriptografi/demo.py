"""Demo ±3 menit: enkripsi & dekripsi data sintetis robot patroli.
Jalankan setelah keygen dan export PATROLI_KEY_FILE."""
import json
from kripto import load_key, encrypt_record, decrypt_record, DecryptionError

kid, key = load_key()
print(f"Kunci dimuat dari $PATROLI_KEY_FILE (key_id={kid}); isi kunci tidak ditampilkan.")

data = {"lat": -6.2001, "lon": 106.8167, "baterai": 78, "event": "gerakan_terdeteksi",
        "zona": "gudang-B", "ts": "2026-11-06T10:15:00Z"}   # SINTETIS
env = encrypt_record(key, kid, "ROBOT-01", "event_deteksi", data)
print("\nEnvelope (yang disimpan/dikirim):\n", env)
print("\nDekripsi sah :", decrypt_record(key, env, "ROBOT-01", "event_deteksi"))

e = json.loads(env); e["ct"] = e["ct"][:-4] + ("AAAA" if e["ct"][-4:] != "AAAA" else "BBBB")
try:
    decrypt_record(key, json.dumps(e))
except DecryptionError as ex:
    print("Data dimodifikasi ->", type(ex).__name__, "(ditolak)")
