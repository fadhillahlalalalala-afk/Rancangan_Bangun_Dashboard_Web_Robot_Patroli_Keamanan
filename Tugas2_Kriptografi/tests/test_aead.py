import base64, json, os, tempfile, unittest
from pathlib import Path
from kripto import (encrypt_record, decrypt_record, generate_key, load_key,
                    DecryptionError, ValidationError, KeyError_)

DATA = {"lat": -6.2, "lon": 106.8, "baterai": 90, "event": "patroli_normal"}  # sintetis
KID, RID, JNS = "k1", "ROBOT-01", "telemetri"


def flip_b64(s):  # ubah 1 byte pada data base64
    raw = bytearray(base64.b64decode(s)); raw[0] ^= 0x01
    return base64.b64encode(bytes(raw)).decode()


class Berhasil(unittest.TestCase):          # skenario sah (>=3)
    def setUp(self): self.key = generate_key()

    def test_S1_roundtrip_sah(self):
        env = encrypt_record(self.key, KID, RID, JNS, DATA)
        self.assertEqual(decrypt_record(self.key, env, RID, JNS), DATA)

    def test_S2_nonce_unik_dan_ciphertext_berbeda(self):
        a = json.loads(encrypt_record(self.key, KID, RID, JNS, DATA))
        b = json.loads(encrypt_record(self.key, KID, RID, JNS, DATA))
        self.assertNotEqual(a["nonce"], b["nonce"])
        self.assertNotEqual(a["ct"], b["ct"])
        self.assertEqual(len(base64.b64decode(a["nonce"])), 12)

    def test_S3_semua_jenis_dan_panjang_tag(self):
        for j in ("telemetri", "event_deteksi", "log_rute", "status"):
            env = json.loads(encrypt_record(self.key, KID, RID, j, DATA))
            ct = base64.b64decode(env["ct"])
            plain_len = len(json.dumps(DATA, separators=(",", ":")))
            self.assertEqual(len(ct), plain_len + 16)  # tag 128-bit
            self.assertEqual(decrypt_record(self.key, json.dumps(env)), DATA)

    def test_S4_kunci_dari_berkas_di_luar_repo(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / "k.key"
            fd = os.open(p, os.O_WRONLY | os.O_CREAT, 0o600)
            with os.fdopen(fd, "w") as f:
                f.write("k9\n" + base64.b64encode(self.key).decode() + "\n")
            kid, k = load_key(p)
            self.assertEqual((kid, k), ("k9", self.key))


class Ditolak(unittest.TestCase):           # skenario tidak sah
    def setUp(self):
        self.key = generate_key()
        self.env = json.loads(encrypt_record(self.key, KID, RID, JNS, DATA))

    def test_T1_ciphertext_dimodifikasi(self):
        e = dict(self.env, ct=flip_b64(self.env["ct"]))
        with self.assertRaises(DecryptionError):
            decrypt_record(self.key, json.dumps(e))

    def test_T2_tag_dimodifikasi(self):
        raw = bytearray(base64.b64decode(self.env["ct"])); raw[-1] ^= 0x80
        e = dict(self.env, ct=base64.b64encode(bytes(raw)).decode())
        with self.assertRaises(DecryptionError):
            decrypt_record(self.key, json.dumps(e))

    def test_T3_kunci_salah(self):
        with self.assertRaises(DecryptionError):
            decrypt_record(generate_key(), json.dumps(self.env))

    def test_T4_aad_diubah_robot_id_ditukar(self):
        e = dict(self.env, rid="ROBOT-02")
        with self.assertRaises(DecryptionError):
            decrypt_record(self.key, json.dumps(e))

    def test_T5_jenis_diubah(self):
        e = dict(self.env, jns="status")
        with self.assertRaises(DecryptionError):
            decrypt_record(self.key, json.dumps(e))

    def test_T6_nonce_diubah(self):
        e = dict(self.env, nonce=flip_b64(self.env["nonce"]))
        with self.assertRaises(DecryptionError):
            decrypt_record(self.key, json.dumps(e))

    def test_T7_konteks_tidak_sesuai_harapan(self):
        with self.assertRaises(DecryptionError):
            decrypt_record(self.key, json.dumps(self.env), expected_robot_id="ROBOT-09")


class Masukan(unittest.TestCase):           # validasi & gagal tertutup
    def setUp(self): self.key = generate_key()

    def test_V1_enkripsi_masukan_invalid(self):
        for args in [(self.key, KID, "robot id!", JNS, DATA),
                     (self.key, KID, RID, "rahasia", DATA),
                     (self.key, KID, RID, JNS, "bukan dict"),
                     (self.key, KID, RID, JNS, {"x": float("nan")}),
                     (self.key, KID, RID, JNS, {"x": "A" * 70000})]:
            with self.assertRaises(ValidationError):
                encrypt_record(*args)

    def test_V2_panjang_kunci_salah(self):
        for bad in (b"pendek", b"A" * 31, b"A" * 33, "string", None):
            with self.assertRaises(KeyError_):
                encrypt_record(bad, KID, RID, JNS, DATA)

    def test_V3_envelope_rusak(self):
        for bad in ("bukan json", "[]", "{}", json.dumps({"v": 2}), 123, None):
            with self.assertRaises(ValidationError):
                decrypt_record(self.key, bad)

    def test_V4_nonce_dan_ct_terpotong(self):
        env = json.loads(encrypt_record(self.key, KID, RID, JNS, DATA))
        with self.assertRaises(ValidationError):
            decrypt_record(self.key, json.dumps(dict(env, nonce="AAAA")))
        with self.assertRaises(ValidationError):
            decrypt_record(self.key, json.dumps(dict(env, ct="AAAA")))

    def test_V5_berkas_kunci_tidak_valid(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(KeyError_):
                load_key(Path(d) / "tidak_ada.key")
            p = Path(d) / "pendek.key"
            fd = os.open(p, os.O_WRONLY | os.O_CREAT, 0o600)
            with os.fdopen(fd, "w") as f: f.write("k1\n" + base64.b64encode(b"x" * 16).decode())
            with self.assertRaises(KeyError_): load_key(p)
            q = Path(d) / "longgar.key"
            q.write_text("k1\n" + base64.b64encode(self.key).decode()); q.chmod(0o644)
            with self.assertRaises(KeyError_): load_key(q)


if __name__ == "__main__":
    unittest.main()
