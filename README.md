# abcnorio-webcomponents

Light-DOM Astro component library with fixture export and package-consumable build artifacts for WordPress ingestion.

## Build Pipeline

Current package scripts:

- `npm run dev`
: Starts local dev server from package root.

- `npm run docker-dev`
: Starts dev server on `0.0.0.0:3033` for container/proxy use.

- `npm run build`
: Builds fixtures into [dist](dist) and generates [dist/manifest.json](dist/manifest.json).

- `npm run check:manifest`
: Validates the manifest contract against dist assets without rebuilding. Also available as `just verify-webcomponents`.

- `npm run check`
: Runs Astro type/content checks.

Use `npm run build` as the canonical artifact build command for ingestion.

## Package Consumer Contract

- Package installs are expected to expose prebuilt library artifacts under [dist](dist).
- Required artifact for downstream ingestion is [dist/manifest.json](dist/manifest.json).
- Manifest schema per component: `id`, `fixtures`, `css`, `js`, `deps` — where `deps` is a flat array of relative dist paths for transitive CSS/JS assets the component requires (e.g. a listing declaring dependency on its child teaser stylesheet). Fixture modules declare deps via `export const metadata = { deps: { css: [], js: [] } }`.
- Runtime shared CSS remains available at [dist/styles/components.css](dist/styles/components.css) when emitted.
- Consumers should ingest from package dist and should not execute package-internal build utilities.

### WP Block Ingestion Contract

Canonical export surface:

- `abcnorio-webcomponents/wp-blocks/block-registry`
- `BLOCK_KEYS` (canonical block key constants)
- `BLOCK_REGISTRY` (canonical routed block map)
- `EMBED_PROVIDER_REGISTRY` (canonical embed provider map)

Consumer usage contract:

- Import `BLOCK_REGISTRY` once per page and pass it into `WpBlockRouter`.
- Use `BLOCK_KEYS` for key comparisons in consumer logic.
- Do not assemble page-local registry maps for routed blocks.

Router export and props:

- Shared router export: `abcnorio-webcomponents/wp-blocks/router`
- Expected props: `component`, `attributes`, `innerBlocks`, `Block`
- Optional runtime props: `restPath`, `cmsUrl`
- Optional override maps: `registry`, `embedRegistry`

Use `BLOCK_KEYS` and `BLOCK_REGISTRY` for all block lookup logic.

### Data Normalization Boundary

- Keep raw REST fields as upstream source (`type`, `featured_media`, `_embedded`).
- Normalize once at adapter/payload-builder boundary into canonical app shape:
	- `post_type`
	- `featured_image` object (`url`, `alt`, `width`, `height`) or `null`
- UI components should consume canonical names only and should not parse WP `_embedded` directly.

## Local Development

- `npm run dev`
: Starts dev server.

Open `/` for the fixture index, then follow the linked fixture routes. Component previewing now happens in site-dev workshop pages; this package stays focused on component source and fixture routes.

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
