#!/usr/bin/env bash
# Read-only expiry check for an iOS .app on macOS.
set -euo pipefail
if [ "$(uname -s)" != "Darwin" ]; then
  echo "Jalankan di Mac. Script memerlukan security cms bawaan macOS." >&2
  exit 1
fi
if [ $# -ne 1 ] || [ ! -d "$1" ]; then
  echo "Pemakaian: ./mobile/check-signing-expiry.sh /path/ke/Settings.app" >&2
  exit 1
fi
PROFILE="$1/embedded.mobileprovision"
if [ ! -f "$PROFILE" ]; then
  echo "Tidak ada embedded.mobileprovision. Pilih build untuk iPhone fisik, bukan Simulator." >&2
  exit 1
fi
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
security cms -D -i "$PROFILE" > "$TMP"
python3 - "$TMP" <<'PY'
import datetime, plistlib, sys
with open(sys.argv[1], 'rb') as stream:
    profile = plistlib.load(stream)
expiry = profile.get('ExpirationDate')
if not expiry:
    raise SystemExit('Profil tidak mencantumkan ExpirationDate.')
expiry = expiry.replace(tzinfo=datetime.timezone.utc)
remaining = expiry - datetime.datetime.now(datetime.timezone.utc)
print('Nama profil:', profile.get('Name', '(tidak tersedia)'))
print('Diterbitkan UTC:', profile.get('CreationDate', '(tidak tersedia)'))
print('Kedaluwarsa UTC:', expiry.isoformat())
print('Sisa waktu:', str(remaining).split('.')[0])
if remaining.total_seconds() <= 0:
    raise SystemExit('SUDAH KEDALUWARSA: signing ulang dan install ulang dari Xcode.')
if remaining < datetime.timedelta(days=7):
    print('Sisa waktu kurang dari 7 x 24 jam. Jangan menjanjikan satu minggu penuh sejak sekarang.')
print('Script ini tidak memperpanjang profil dan tidak menjamin aplikasi sudah terpasang pada iPhone.')
PY
