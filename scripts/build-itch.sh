#!/usr/bin/env bash
set -e

echo "📦 Building They Might Byte for Itch.io Release..."
pnpm run build

echo "🗜️ Packaging dist/ into release zip archive using Python zipfile..."
python3 -c "import shutil; shutil.make_archive('they-might-byte-release', 'zip', 'dist')"

echo "✅ Release package created at: they-might-byte-release.zip"
ls -lh they-might-byte-release.zip
