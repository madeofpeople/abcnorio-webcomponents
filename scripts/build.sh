#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
export PATH="$PWD/node_modules/.bin:$PATH"
bash scripts/sync-font-assets.sh
astro build
cp src/components/wp-blocks/gallery/image-sizes.json dist/gallery-image-sizes.json
vite build --config vite.elements.config.mjs
node src/util/generate-fixtures-registry.js
node src/util/validate-manifest.js
