"""Bangkitkan kunci AES-256 ke berkas DI LUAR repository.

Pemakaian:
    python -m kripto.keygen ~/.config/patroli/kunci_v1.key k1
Lalu:
    export PATROLI_KEY_FILE=~/.config/patroli/kunci_v1.key
"""
import base64
import os
import sys
from pathlib import Path

from .aead import KEY_ID_RE, generate_key


def main() -> int:
    if len(sys.argv) != 3:
        print("Pemakaian: python -m kripto.keygen <path_berkas_kunci> <key_id>")
        return 2
    path, kid = Path(sys.argv[1]).expanduser().resolve(), sys.argv[2]
    if not KEY_ID_RE.match(kid):
        print("key_id tidak valid (A-Z a-z 0-9 _ -, maks 16).")
        return 2
    repo_root = Path(__file__).resolve().parent.parent
    if repo_root in path.parents:
        print("DITOLAK: berkas kunci tidak boleh berada di dalam repository.")
        return 1
    if path.exists():
        print("DITOLAK: berkas sudah ada (tidak menimpa kunci lama).")
        return 1
    path.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w", encoding="ascii") as f:
        f.write(f"{kid}\n{base64.b64encode(generate_key()).decode('ascii')}\n")
    print(f"Kunci dibuat: {path} (izin 600). Jangan di-commit.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
