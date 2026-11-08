# Webcomponents reference

Light-DOM Astro component library with fixture export for WordPress ingestion as a package.

## Build Pipeline

Current package scripts:

- `npm run dev`
: Starts local dev server from package root.

- `npm run docker-dev`
: Starts dev server on `0.0.0.0:3033` for container/proxy use.

- `npm run build`
: Builds fixtures into [dist](../dist) and generates [dist/manifest.json](../dist/manifest.json).

- `npm run check:manifest`
: Validates the manifest contract against dist assets without rebuilding. Also available as `just wc-verify`.

- `npm run check`
: Runs Astro type/content checks.

Use `npm run build` as the canonical artifact build command for ingestion.

## Package Consumer Contract

- Package installs are expected to expose prebuilt library artifacts under [dist](../dist).
- Required artifact for downstream ingestion is [dist/manifest.json](../dist/manifest.json).
- Manifest schema per component: `id`, `fixtures`, `css`, `js`, `deps`.
- Fixtures explicitly declare assets needed by WordPress via `export const metadata = { deps: { css: [], js: [] } }`. The manifest `deps` list preserves these paths, including assets also listed under `css` or `js`.
- WordPress enqueues declared dependencies when its block requests them. Declared JS files are loaded as ES modules; use dist-relative paths. Astro loads component scripts independently.
- Event Listing declares its slider module for the WordPress editor preview; Gallery does not load its frontend module in WordPress.
- Gallery uses its own editor controls and does not request the frontend gallery script in WordPress.
- Runtime shared CSS remains available at [dist/styles/components.css](../dist/styles/components.css) when emitted.
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

### Editor styling parity

Component SCSS is the source of shared frontend and WordPress editor styles.
Match selectors to editor markup; editable core blocks can differ from Astro markup as needed. 
PHP previews use fixture markup with Astro's scope attributes so component styles
apply (e.g. `<img class="article-teaser__image" data-astro-cid-a1b2c3>`).
`just wc-build` (`npm run build`) generates fixture HTML and styles together;
`just plugin-dev-assets` rebuilds and ingests that output in the plugin.

Include optional elements in fixtures when PHP will populate them, such as teaser images.

Editor-only presentation exceptions belong with the component styles when possible.
WordPress admin controls and interactions can require separate
editor rules. `additionalClasses` passes context to a component; it does not
add classes to editable WordPress blocks.

Parity review covers image, list, quote, hero, gallery, announcement/sidebar
touts, teaser/listing, group/button, newsletter, press item, public form and
core embed previews. Visual checks were confirmed by the user. Gallery and
event slider navigation have both mocked tests and user-confirmed runtime
checks. To run component tests, use:

```sh
node --experimental-vm-modules --test test/*.test.mjs
```

The public form style wrapper is shared with the site frontend and exported
in the fixture build for the WordPress editor. Form submission remains owned
by the frontend; the editor preview is non-submitting.
Frontend releases need a webcomponents package containing the `public-form`
export; plugin releases need the corresponding ingested component build.

### Data Normalization Boundary

- Keep raw REST fields as upstream source (`type`, `featured_media`, `_embedded`).
- Normalize once at adapter/payload-builder boundary into canonical app shape:
	- `post_type`
	- `featured_image` object (`url`, `alt`, `width`, `height`) or `null`
- UI components should consume canonical names only and should not parse WP `_embedded` directly.

## Local Development

- `npm run dev`
: Starts dev server.

Open `/` for the fixture index, then follow the linked fixture routes. Component previewing now happens in site-frontend workshop pages; this package stays focused on component source and fixture routes.

## Design Tokens

Token source lives in [src/design-tokens](../src/design-tokens):

- Core partials: `_colors.scss`, `_breakpoints.scss`, `_typography.scss`, `_spacing.scss`, `_fonts.scss`
- Mixins: [src/design-tokens/mixins](../src/design-tokens/mixins)
- Font files: [src/design-tokens/fonts](../src/design-tokens/fonts)

Token usage contract:

- SCSS modules import from Sass load paths, e.g. `@use 'colors'`, `@use 'breakpoints'`, `@use 'mixins/layout'`.
- Asset URL alias is `@tokens/...` (configured in Astro/Vite alias) for token-hosted static assets such as fonts.
- Shared component token include lives in [src/components/_design-tokens.scss](../src/components/_design-tokens.scss).

## Layout

- Components: [src/components](../src/components)
- Fixture route export: [src/pages/[...slug].astro](../src/pages/[...slug].astro)
- Fixture manifest generator: [src/util/generate-fixtures-registry.js](../src/util/generate-fixtures-registry.js)
