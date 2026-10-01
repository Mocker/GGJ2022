#!/usr/bin/env bash
set -e

echo "📦 Building They Might Byte for Itch.io Release..."
pnpm run build

echo "🗜️ Packaging dist/ into release zip archive using Node.js..."
node scripts/package-itch.js

echo "✅ Release package created at: they-might-byte-release.zip"
ls -lh they-might-byte-release.zip
