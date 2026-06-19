#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/src/design-tokens/fonts"
DST_DIR="$ROOT_DIR/public/assets"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Missing source fonts directory: $SRC_DIR" >&2
  exit 1
fi

mkdir -p "$DST_DIR"
cp -f "$SRC_DIR"/*.woff2 "$DST_DIR"/

echo "Synced fonts: $SRC_DIR -> $DST_DIR"
