#!/usr/bin/env bash
# Pemindaian image sebelum dan sesudah + SBOM - sec-0.2
# Risiko Tugas 1: Risk-04 (rantai pasokan dan kerentanan komponen), T04
# Prasyarat: docker dan trivy (https://trivy.dev). Jalankan dari root repository.
set -euo pipefail

echo "[1/5] Build image SEBELUM (Dockerfile.before)"
docker build -f Dockerfile.before -t securebot:before .

echo "[2/5] Pindai image SEBELUM -> image-scan-before.txt"
trivy image --severity LOW,MEDIUM,HIGH,CRITICAL \
  --format table -o image-scan-before.txt securebot:before

echo "[3/5] Build image SESUDAH (Dockerfile)"
docker build -f Dockerfile -t securebot:fixed .

echo "[4/5] Pindai image SESUDAH -> image-scan-after.txt"
trivy image --severity LOW,MEDIUM,HIGH,CRITICAL \
  --format table -o image-scan-after.txt securebot:fixed

echo "[5/5] Buat SBOM CycloneDX -> sbom.cdx.json"
trivy image --format cyclonedx -o sbom.cdx.json securebot:fixed

echo
echo "Ringkasan jumlah kerentanan CRITICAL:"
echo -n "  sebelum: "; grep -c "CRITICAL" image-scan-before.txt || true
echo -n "  sesudah: "; grep -c "CRITICAL" image-scan-after.txt || true

echo
echo "Gerbang: gagal bila image akhir masih memuat CRITICAL"
trivy image --severity CRITICAL --exit-code 1 --quiet securebot:fixed \
  && echo "LULUS: tidak ada CRITICAL pada securebot:fixed"
