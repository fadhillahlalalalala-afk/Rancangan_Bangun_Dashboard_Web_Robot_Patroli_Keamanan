"""
Modul AEAD untuk Dashboard Web Robot Patroli Keamanan.

Melindungi kerahasiaan + integritas data telemetri / log patroli (rekaman
posisi, event deteksi, status baterai) dengan AES-256-GCM dari pustaka
`cryptography` (dipelihara aktif, berbasis OpenSSL).

Prinsip:
- Kunci 256-bit dibangkitkan dengan CSPRNG (os.urandom) dan TIDAK ada di repo.
- Nonce 96-bit acak baru untuk setiap enkripsi (tidak pernah dipakai ulang).
- AAD mengikat ciphertext ke konteks (versi, key id, robot_id, jenis record).
- Semua kegagalan -> gagal tertutup: tidak ada plaintext parsial yang keluar,
  pesan galat tidak membocorkan penyebab spesifik.
"""
from __future__ import annotations

import base64
import binascii
import json
import os
import re
import stat
from pathlib import Path

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# ---- Parameter (didokumentasikan di KEPUTUSAN.md) -------------------------
VERSION = 1
KEY_BYTES = 32          # AES-256
NONCE_BYTES = 12        # 96-bit, rekomendasi NIST SP 800-38D
TAG_BYTES = 16          # 128-bit, ditambahkan di akhir ciphertext oleh pustaka
MAX_PLAINTEXT = 64 * 1024   # batas 64 KiB per record
MAX_ENVELOPE = 128 * 1024
ROBOT_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,32}$")
KEY_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,16}$")
JENIS_DIIZINKAN = frozenset({"telemetri", "event_deteksi", "log_rute", "status"})

KEY_ENV_VAR = "PATROLI_KEY_FILE"   # path berkas kunci DI LUAR repository


class ValidationError(ValueError):
    """Masukan tidak valid (format, panjang, nilai di luar daftar izin)."""


class KeyError_(Exception):
    """Kunci tidak ada / tidak valid / izin berkas terlalu longgar."""


class DecryptionError(Exception):
    """Dekripsi gagal: data/tag diubah, kunci salah, atau konteks (AAD) berbeda.
    Sengaja generik agar tidak menjadi oracle bagi penyerang."""


# ---- Kunci ----------------------------------------------------------------
def generate_key() -> bytes:
    """Bangkitkan kunci 256-bit dari CSPRNG sistem operasi."""
    return os.urandom(KEY_BYTES)


def load_key(path: str | os.PathLike | None = None) -> tuple[str, bytes]:
    """Baca kunci dari berkas di luar repository.

    Format berkas (teks): baris pertama `key_id`, baris kedua kunci base64.
    Gagal tertutup bila berkas hilang, format salah, panjang kunci bukan 32 byte,
    atau (di POSIX) berkas dapat dibaca grup/pengguna lain.
    """
    path = path or os.environ.get(KEY_ENV_VAR)
    if not path:
        raise KeyError_(f"Variabel lingkungan {KEY_ENV_VAR} belum diatur.")
    p = Path(path)
    if not p.is_file():
        raise KeyError_("Berkas kunci tidak ditemukan.")
    if os.name == "posix" and (p.stat().st_mode & (stat.S_IRWXG | stat.S_IRWXO)):
        raise KeyError_("Izin berkas kunci terlalu longgar (harus 600).")
    try:
        lines = p.read_text(encoding="ascii").split()
        kid, b64 = lines[0], lines[1]
        key = base64.b64decode(b64, validate=True)
    except (IndexError, UnicodeDecodeError, binascii.Error):
        raise KeyError_("Format berkas kunci tidak valid.") from None
    if not KEY_ID_RE.match(kid):
        raise KeyError_("key_id tidak valid.")
    if len(key) != KEY_BYTES:
        raise KeyError_("Panjang kunci harus 32 byte (AES-256).")
    return kid, key


def _check_key(key: object) -> bytes:
    if not isinstance(key, (bytes, bytearray)) or len(key) != KEY_BYTES:
        raise KeyError_("Kunci harus bytes sepanjang 32 byte.")
    return bytes(key)


# ---- Validasi -------------------------------------------------------------
def _validate_context(robot_id: object, jenis: object) -> None:
    if not isinstance(robot_id, str) or not ROBOT_ID_RE.match(robot_id):
        raise ValidationError("robot_id tidak valid.")
    if not isinstance(jenis, str) or jenis not in JENIS_DIIZINKAN:
        raise ValidationError("jenis record tidak diizinkan.")


def _build_aad(kid: str, robot_id: str, jenis: str) -> bytes:
    # Pemisah '|' aman karena semua field sudah divalidasi tanpa '|'.
    return f"v{VERSION}|{kid}|{robot_id}|{jenis}".encode("ascii")


def _b64e(b: bytes) -> str:
    return base64.b64encode(b).decode("ascii")


def _b64d(s: object) -> bytes:
    if not isinstance(s, str):
        raise ValidationError("Field base64 tidak valid.")
    try:
        return base64.b64decode(s, validate=True)
    except binascii.Error:
        raise ValidationError("Field base64 tidak valid.") from None


# ---- API publik -----------------------------------------------------------
def encrypt_record(key: bytes, key_id: str, robot_id: str, jenis: str,
                   data: dict) -> str:
    """Enkripsi satu record -> string JSON 'envelope' aman disimpan/dikirim."""
    key = _check_key(key)
    if not isinstance(key_id, str) or not KEY_ID_RE.match(key_id):
        raise ValidationError("key_id tidak valid.")
    _validate_context(robot_id, jenis)
    if not isinstance(data, dict):
        raise ValidationError("data harus berupa dict.")
    try:
        plaintext = json.dumps(data, separators=(",", ":"),
                               ensure_ascii=True, allow_nan=False).encode("ascii")
    except (TypeError, ValueError):
        raise ValidationError("data tidak dapat diserialisasi.") from None
    if len(plaintext) > MAX_PLAINTEXT:
        raise ValidationError("data melebihi batas ukuran.")

    nonce = os.urandom(NONCE_BYTES)                      # unik per enkripsi
    aad = _build_aad(key_id, robot_id, jenis)
    ct = AESGCM(key).encrypt(nonce, plaintext, aad)      # ct = ciphertext || tag
    return json.dumps({
        "v": VERSION, "kid": key_id, "rid": robot_id, "jns": jenis,
        "nonce": _b64e(nonce), "ct": _b64e(ct),
    }, separators=(",", ":"))


def decrypt_record(key: bytes, envelope: str,
                   expected_robot_id: str | None = None,
                   expected_jenis: str | None = None) -> dict:
    """Verifikasi tag lalu dekripsi. Gagal tertutup: raise, tidak return parsial."""
    key = _check_key(key)
    if not isinstance(envelope, str) or len(envelope) > MAX_ENVELOPE:
        raise ValidationError("envelope tidak valid.")
    try:
        env = json.loads(envelope)
    except json.JSONDecodeError:
        raise ValidationError("envelope bukan JSON valid.") from None
    if not isinstance(env, dict) or set(env) != {"v", "kid", "rid", "jns", "nonce", "ct"}:
        raise ValidationError("struktur envelope tidak valid.")
    if env["v"] != VERSION:
        raise ValidationError("versi envelope tidak didukung.")
    kid, rid, jns = env["kid"], env["rid"], env["jns"]
    if not isinstance(kid, str) or not KEY_ID_RE.match(kid):
        raise ValidationError("key_id tidak valid.")
    _validate_context(rid, jns)
    if expected_robot_id is not None and rid != expected_robot_id:
        raise DecryptionError("Dekripsi gagal.")
    if expected_jenis is not None and jns != expected_jenis:
        raise DecryptionError("Dekripsi gagal.")

    nonce, ct = _b64d(env["nonce"]), _b64d(env["ct"])
    if len(nonce) != NONCE_BYTES:
        raise ValidationError("panjang nonce tidak valid.")
    if len(ct) < TAG_BYTES or len(ct) > MAX_PLAINTEXT + TAG_BYTES:
        raise ValidationError("panjang ciphertext tidak valid.")

    try:
        pt = AESGCM(key).decrypt(nonce, ct, _build_aad(kid, rid, jns))
    except InvalidTag:
        raise DecryptionError("Dekripsi gagal.") from None
    try:
        data = json.loads(pt)
    except json.JSONDecodeError:
        raise DecryptionError("Dekripsi gagal.") from None
    if not isinstance(data, dict):
        raise DecryptionError("Dekripsi gagal.")
    return data
