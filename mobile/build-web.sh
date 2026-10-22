#!/usr/bin/env bash
# Build local React bundles; no deployment or signing is performed.
set -euo pipefail
MODE="${1:-}"
BACKEND_URL="${2:-}"
if [ "$MODE" != "settings" ] && [ "$MODE" != "phone" ]; then
  echo "Usage: ./mobile/build-web.sh <settings|phone> [HTTPS_BACKEND_URL]" >&2
  exit 1
fi
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/frontend"
if [ -z "$BACKEND_URL" ]; then
  BACKEND_URL="${REACT_APP_BACKEND_URL:-}"
fi
if [ -z "$BACKEND_URL" ] && [ -f "$ROOT/mobile/backend-url.txt" ]; then
  BACKEND_URL="$(tr -d '\r\n' < "$ROOT/mobile/backend-url.txt")"
fi
if [ -z "$BACKEND_URL" ]; then
  echo "Berikan URL backend HTTPS. Jangan build dengan URL backend kosong." >&2
  exit 1
fi
case "$BACKEND_URL" in
  https://*) ;;
  *) echo "Backend iPhone wajib memakai HTTPS." >&2; exit 1 ;;
esac
BACKEND_URL="${BACKEND_URL%/}"
echo "==> Building $MODE with backend: $BACKEND_URL"
REACT_APP_CAP_APP="$MODE" REACT_APP_BACKEND_URL="$BACKEND_URL" GENERATE_SOURCEMAP=false yarn build
DEST="$ROOT/mobile/$MODE/www"
rm -rf "$DEST"
mkdir -p "$DEST"
cp -R build/. "$DEST/"
echo "==> Bundle copied. Next: ./mobile/ios-setup.sh $MODE; then Run from Xcode."
