# abcnorio-webcomponents

Light-DOM Astro component library with fixture export and package-consumable build artifacts for WordPress ingestion.

## Build Pipeline

Current package scripts:

- `npm run dev`
: Starts local dev server from package root.

- `npm run docker-dev`
: Starts dev server on `0.0.0.0:3033` for container/proxy use.

- `npm run build`
: Builds fixtures into [dist](dist) and generates [dist/fixtures-manifest.json](dist/fixtures-manifest.json).

- `npm run check`
: Runs Astro type/content checks.

Use `npm run build` as the canonical artifact build command for ingestion.

## Package Consumer Contract

- Package installs are expected to expose prebuilt library artifacts under [dist](dist).
- Required artifacts for downstream ingestion are [dist/fixtures-manifest.json](dist/fixtures-manifest.json) and [dist/styles/components.css](dist/styles/components.css).
- Consumers should ingest from package dist and should not execute package-internal build utilities.

### WP Block Router Export

- Shared router export: `abcnorio-webcomponents/wp-blocks/router`
- Core block renderers remain package-owned under `abcnorio-webcomponents/wp-blocks/*`.
- Consumers can pass a `registry` override map for site-specific blocks without forking core block routing.

Expected router props:

- `component`, `attributes`, `innerBlocks`, `Block`
- Optional site runtime props: `restPath`, `cmsUrl`
- Optional override maps: `registry`, `embedRegistry`

Recommended boundary:

- Keep presentational/default block routing in this package.
- Keep site REST/query orchestration in consumer adapters.

## Local Development

- `npm run dev`
: Starts dev server.

Open `/stargazer` for component previews. Stargazer registry is manually curated in [stargazer.config.ts](stargazer.config.ts) (`mode: 'files'`).

## Design Tokens

Token source lives in [src/design-tokens](src/design-tokens):

- Core partials: `_colors.scss`, `_breakpoints.scss`, `_typography.scss`, `_spacing.scss`, `_fonts.scss`
- Mixins: [src/design-tokens/mixins](src/design-tokens/mixins)
- Font files: [src/design-tokens/fonts](src/design-tokens/fonts)

Token usage contract:

- SCSS modules import from Sass load paths, e.g. `@use 'colors'`, `@use 'breakpoints'`, `@use 'mixins/layout'`.
- Asset URL alias is `@tokens/...` (configured in Astro/Vite alias) for token-hosted static assets such as fonts.
- Shared component token include lives in [src/components/_design-tokens.scss](src/components/_design-tokens.scss).

## Layout

- Components: [src/components](src/components)
- Fixture route export: [src/pages/[...slug].astro](src/pages/[...slug].astro)
- Fixture manifest generator: [src/util/generate-fixtures-registry.js](src/util/generate-fixtures-registry.js)
