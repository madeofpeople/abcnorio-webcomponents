# abcnorio-webcomponents

Shared Astro components and fixtures for the frontend and WordPress editor.

Each component can own an optional `editor.scss` beside its normal stylesheet.
The build emits `dist/styles/editor/<component>.css` and records it as
`components[component].editorCss` in the manifest. WordPress loads these files
only in the block editor. Never import `editor.scss` from Astro or frontend JS.

Keep content component styling in those files, not plugin admin overrides.
Do not target every editor `button`: WordPress controls and block appenders
retain their native styles. Components with no editor-specific presentation
need no `editor.scss`.

For fully global component Sass, use Astro's `<style lang="scss" is:global>`
and normal nested selectors anchored to the component root. Keep targeted
`:global(...)` escapes when a stylesheet intentionally mixes scoped elements
with child-component or dynamically generated markup. A Sass `:global { ... }`
block is not a substitute for Astro's `is:global`.

Announcement Tout shares Sass mixins between its normal stylesheet and
`editor.scss`, preserving editor selector specificity without duplicating
declarations.

Event/Content Listing editor wrappers expose responsive `--listing-preview-slides*`
values from block settings. Their editor styles preserve configured card widths
when Blaze clamps its slide count to the number of available items.

## Create a component

Run recipes from [abcnorio-meta](../abcnorio-meta):

```sh
just wc-create event-card
just wc-create-wp cover core/cover
just wc-create-wp example-tout abcnorio/example-tout
```

`wc-create-wp` creates a frontend block wrapper and adds it to the block
registry. It does not register a block in WordPress or create an editor preview.
Embed providers use a separate registry and are not scaffolded here.

Both recipes create Astro, SCSS, JS and fixture files, package exports and type
declarations. The component initially displays debug output. Replace it with
your markup and styles, then:

1. Add representative props to the fixture, including optional elements that
   PHP previews need to populate.
2. Declare assets WordPress needs in fixture dependencies. Leave JS out when
   the WP preview doesn't need it; Astro loads its own component scripts.
3. Implement WordPress registration and preview separately if needed.

Names must start with a letter. Fixture names must be unique, even across
components and WP block wrappers.

## Preview and build

Gallery includes a `captioned` variant ("Captioned Gallery" in WordPress).
It uses slider navigation, renders each image in a figure with its optional
caption beneath, and does not initialize PhotoSwipe. Captions use the existing
core/image caption field; empty captions render no caption block.

From this package:

```sh
npm run dev
npm run build
npm run check
node --experimental-vm-modules --test test/*.test.mjs
```

Open `/` on the dev server for fixture links. Component previews also live in
the site-frontend workshop.

From [abcnorio-meta](../abcnorio-meta):

```sh
just wc-build           # Build fixtures and assets
just wc-verify          # Check the existing manifest
just plugin-dev-assets  # Build and refresh local WP preview assets
```

The Blaze fork is bundled from `vendor/blaze-slider-1.9.3-9def7d5.tgz` so
consumer installs do not build the fork. To update it, build the Blaze workspace
in the fork, pack its `blaze-slider` workspace, replace the tarball, and update
the dependency path and lockfile. Keep the fork commit in the tarball filename.

See [reference](docs/reference.md) for fixture and manifest contracts, block
routing, editor styling, data normalization and design tokens.
