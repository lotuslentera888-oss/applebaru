#!/usr/bin/env bash
# Produces a genuine iPhone native build, WITHOUT signing or provisioning.
# Unsigned IPA cannot be installed directly. Re-sign it before sideloading.
set -euo pipefail
MODE="${1:-}"
case "$MODE" in phone|settings) ;; *) echo "Usage: $0 <phone|settings> [output_dir]" >&2; exit 1 ;; esac
if [ "$(uname -s)" != "Darwin" ]; then
  echo "This build requires macOS and Xcode, e.g. a GitHub macOS runner." >&2
  exit 1
fi
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${2:-$ROOT/artifacts}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
WRAPPER="$ROOT/mobile/$MODE"
BUILD="$ROOT/ios-build/$MODE"
NAME="$(python3 - "$WRAPPER/capacitor.config.json" <<'PY'
import json,sys
with open(sys.argv[1]) as source:
    print(json.load(source)['appName'])
PY
)"
if [ ! -d "$WRAPPER/node_modules/@capacitor/ios" ]; then
  echo "Run npm ci inside mobile/$MODE first." >&2
  exit 1
fi
if [ ! -f "$WRAPPER/www/index.html" ]; then
  echo "The prebuilt local web bundle is missing." >&2
  exit 1
fi
python3 "$ROOT/scripts/bundle-manifest.py" "$MODE" --check
swift "$ROOT/scripts/export-sf-symbols.swift" "$WRAPPER/www/icons/sf"
mkdir -p "$BUILD"
(
  cd "$WRAPPER"
  npx --no-install cap sync ios
)
xcodebuild -version
xcodebuild \
  -project "$WRAPPER/ios/App/App.xcodeproj" \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -archivePath "$BUILD/$NAME.xcarchive" \
  -derivedDataPath "$BUILD/DerivedData" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY='' \
  COMPILER_INDEX_STORE_ENABLE=NO \
  archive 2>&1 | tee "$OUT/$NAME-xcodebuild.log"
APP="$BUILD/$NAME.xcarchive/Products/Applications/App.app"
if [ ! -d "$APP" ]; then
  echo "Xcode did not produce the expected native .app." >&2
  exit 1
fi
PLATFORM="$(/usr/libexec/PlistBuddy -c 'Print :DTPlatformName' "$APP/Info.plist")"
if [ "$PLATFORM" != "iphoneos" ]; then
  echo "Refusing to package a simulator or non-iPhone app: $PLATFORM" >&2
  exit 1
fi
EXECUTABLE="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$APP/Info.plist")"
file "$APP/$EXECUTABLE" | tee "$OUT/$NAME-executable.txt"
file "$APP/$EXECUTABLE" | grep -q 'Mach-O.*arm64'
STAGING="$(mktemp -d)"
trap 'rm -rf "$STAGING"' EXIT
mkdir -p "$STAGING/Payload"
cp -R "$APP" "$STAGING/Payload/App.app"
IPA="$OUT/$NAME-unsigned.ipa"
rm -f "$IPA"
(cd "$STAGING" && /usr/bin/zip -qry "$IPA" Payload)
/usr/bin/unzip -t "$IPA" >/dev/null
/usr/bin/shasum -a 256 "$IPA" > "$IPA.sha256"
cat > "$OUT/$NAME-SIGNING-NOTICE.txt" <<EOF
$NAME-unsigned.ipa is a native iPhone arm64 application compiled by Xcode.
It is UNSIGNED: no Apple certificate or provisioning profile was used.
It CANNOT be installed directly on an iPhone. Sign it with a valid profile
using an appropriate sideload tool or Apple development/distribution flow.
A free Personal Team profile expires 7 days after issuance. Actual validity
must be checked in the signed profile; this build does not extend validity.
Bundle identifier: $(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$APP/Info.plist")
EOF
printf 'IPA created: %s\n' "$IPA"
