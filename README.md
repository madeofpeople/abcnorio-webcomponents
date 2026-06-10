# abcnorio-webcomponents

Light-DOM Astro component library with fixture export and bind-mount-friendly build artifacts for WordPress ingestion.

## Build Pipeline

Library build and demo build are intentionally split:

- `npm run build:lib`
: Builds library fixtures into [dist](dist) and generates [dist/fixtures-manifest.json](dist/fixtures-manifest.json).

- `npm run build:demo`
: Builds demo site in [demo](demo) only.

- `npm run build`
: Runs library build first, then demo build.

## Local Development

- `npm run dev`
: Starts demo dev server.

- `npm run dev:demo`
: Explicit alias for demo dev server.

Open `/stargazer` on the demo dev server for component previews.

## Layout

- Components: [src/components](src/components)
- Fixture route export: [src/pages/[...slug].astro](src/pages/[...slug].astro)
- Fixture manifest generator: [src/util/generate-fixtures-registry.js](src/util/generate-fixtures-registry.js)
- Demo app: [demo](demo)
