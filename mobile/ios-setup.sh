#!/usr/bin/env bash
# One-command setup on your Mac after cloning the repo.
# Restores node_modules (required for Capacitor's Swift Package Manager local
# packages) and syncs the native iOS projects, then you can open them in Xcode.
#
# Requirements on the Mac:
#   - Node 22+ (Capacitor 8 CLI requires Node >= 22)
#   - Yarn         (npm i -g yarn)
#   - Xcode        (from the Mac App Store)
#
# Usage:
#   chmod +x mobile/ios-setup.sh
#   ./mobile/ios-setup.sh            # sets up BOTH apps
#   ./mobile/ios-setup.sh phone      # only the Phone app
#   ./mobile/ios-setup.sh settings   # only the Settings app
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
APPS=("$@")
if [ ${#APPS[@]} -eq 0 ]; then APPS=(phone settings); fi

for APP in "${APPS[@]}"; do
  DIR="$ROOT/$APP"
  if [ ! -d "$DIR" ]; then echo "skip: $APP (no folder)"; continue; fi
  echo "==> [$APP] yarn install"
  (cd "$DIR" && yarn install)
  echo "==> [$APP] npx cap sync ios"
  (cd "$DIR" && npx cap sync ios)
  echo "==> [$APP] ready. Open: mobile/$APP/ios/App/App.xcodeproj"
done

echo ""
echo "All set. In Xcode: select the App target ->"
echo "Signing & Capabilities -> Team -> your Personal Team -> pick your iPhone -> Run."
