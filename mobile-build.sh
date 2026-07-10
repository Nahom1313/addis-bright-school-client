#!/bin/bash
# ─── Addis Bright Mobile Build Script ────────────────────────────
# Builds the React app and syncs it to Android/iOS native projects
#
# Prerequisites:
#   Android: Android Studio + JDK 17 installed
#   iOS:     Xcode installed (Mac only)
#
# First time setup:
#   npx cap add android
#   npx cap add ios      (Mac only)
#
# Usage:
#   ./mobile-build.sh android   — build & open Android Studio
#   ./mobile-build.sh ios       — build & open Xcode (Mac only)
#   ./mobile-build.sh both      — build both

set -e
PLATFORM=${1:-android}

echo "📦 Building React app..."
npm run build

echo "🔄 Syncing to Capacitor..."
npx cap sync $PLATFORM

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "both" ]; then
  echo "🤖 Opening Android Studio..."
  npx cap open android
fi

if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "both" ]; then
  echo "🍎 Opening Xcode..."
  npx cap open ios
fi

echo "✅ Done! Build and run from the IDE."
echo ""
echo "📱 To generate a release APK (Android):"
echo "   Android Studio → Build → Generate Signed Bundle/APK"
