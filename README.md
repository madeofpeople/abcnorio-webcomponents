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

Event/Content Listing editor styles accept responsive `--listing-preview-slides*`
overrides and supply defaults matching their components. They preserve card widths
when Blaze clamps its slide count to the number of available items.

## Shared WordPress styles and local development

Group children in flex rows preserve Gutenberg's `style.layout.selfStretch`:
Fit uses intrinsic sizing, Grow takes available space, Max uses `flexSize` but
can shrink, and Fixed uses `flexSize` without shrinking. Unconfigured children
fit their content rather than automatically taking equal shares of the row.
Fixed widths can intentionally overflow a narrow no-wrap row.

Core images use the selected resolution (`sizeSlug`) and responsive image variants,
and preserve custom width/height, aspect ratio, scale (cover/contain) and native
focal point on both captioned and uncaptioned images. Focal point positions the
image inside its crop; it does not change the source file.

Hero, group, gallery, event listing, event teaser, content listing and article teaser use portable, component-namespaced
SCSS. Astro loads these through stylesheet URLs rather than scoped style blocks.
The same SCSS compiles to separate `styles/<component>.css` assets; it is not also
bundled into `component-fixtures.css`. Shared slider mixins retain their existing
Astro-scoped default; these portable entries opt out with `$scoped: false`.

`src/styles/editor-style-entries.js` declares the portable source entries. Manifest
generation records them in `styleEntries` and adds their packaged CSS to `shared.css`.
Optional `editor.scss` files continue to use `components[id].editorCss`; migrated
entries additionally record their editor source in `styleEntries`.

For WordPress development, run `just dev-local` from the sibling meta repository
after installing host dependencies in webcomponents and the plugin and installing
Watchexec (`brew install watchexec` on macOS). Its queued watcher invokes this
package's `scripts/build.sh`; the plugin validates/publishes the result locally.
Wait for `[components] Ready`, then refresh the editor. Markup, styles and element
JS all use this same build path. No commits, dependency pins, editor auto-reload
or running Astro frontend are required.

`npm run build` delegates to the same script, including font synchronization.
Manifest generation reuses one asynchronous Sass compiler for all styles.
The Astro frontend continues importing source with native live updates.

WordPress keeps Gutenberg/React in charge of InnerBlocks. Gallery navigation scrolls
the existing image blocks; it does not initialize the frontend gallery runtime,
clone images, or open PhotoSwipe. Data/template/JavaScript edits still require their
automatic build workflow. Staging and release builds remain packaged and need no dev server.

Hero shares its Astro presentation markup with the WordPress editor. Its named
`image` slot and default slot retain normal frontend fallbacks. The `editor`
fixture supplies `__EDITOR_SLOT_IMAGE__` and `__EDITOR_SLOT_CONTENT__` as plain
text markers; the plugin's shared shell adapter inserts React-owned media
controls and InnerBlocks there, in light DOM. Its editor-only `data-editor-root`
and `data-editor-bind="image"` identify the block root and image-style binding.
Keep each marker exactly once. This is generated
markup reuse, not runtime native slot projection or an Astro server in WordPress.
Changes to that shell follow the same build/publish/refresh workflow above.
Do not pass HTML strings into the fixture slots: Astro escapes them.

Announcement tout follows the same contract: its `editor` fixture declares a
content region and toast/title bindings (text, heading level and optional
visibility). The normal Astro component owns their tags/classes; WordPress
supplies inspector state and InnerBlocks, not a second JSX presentation tree.
All `<component>/editor` fixtures are discovered from the packaged manifest and
loaded in one editor configuration. Editor declaration attributes must not leak
into normal frontend fixtures.

Gallery uses the same shell adapter with refs and `useInnerBlocksProps` bound to
the actual editable track. Astro owns its item wrapper and navigation markup.
`<template data-editor-repeat="name">` declares scoped keyed editor repeaters;
the public runtime clones the same `data-gallery-template` page/dot markup.
The item template uses the same `GalleryItem.astro` partial as normal image items.
WordPress retains its required outer editor wrapper and core/image edit/save
elements rather than wrapping/reparenting React-owned images.
All gallery navigation is page-based; responsive slider visibility/scroll
counts remain 2 at base/XS, 3 at SM/MD and 4 at LG. Paged-grid page size is a
separate setting. Runtime dots refresh after Blaze updates its responsive states,
not before its deferred resize refresh.

Newsletter WordPress previews intentionally remain generic placeholders, not
working forms or a recreation of selected fields/groups. `NewsletterPreview.astro`
owns the inert markup shared through `newsletter-signup/preview` (PHP) and
`newsletter-signup/editor` (React text/visibility bindings). It has a disabled
button and no actual form, inputs or runtime initialization marker. Preview
fixtures do not fetch list data. The normal Astro form remains unchanged.

Public forms follow the same placeholder approach. The `public-form/editor`
fixture declares title, slug, status and submit-label bindings and a disabled
button. It contains no real form/inputs, field/group presentation or submission
runtime. The normal `public-form` component remains a style-owning slot wrapper;
the frontend application's FormShell/FieldControl and submission code stay put.

Press item declares an `editor` fixture for its existing article/time/heading/
source markup. WordPress binds RichText to the declared elements using the
shared adapter's render binding; no custom element or frontend JS is needed.
Date formatting comes from the exported `util/dates` helper in both consumers.
The normal linked-source/fallback-date frontend fixtures retain their markup.

Event/collective listing fixtures include optional count regions for WordPress
to populate or remove. Event listing's `countLabel` is opt-in and empty by
default; collective listing retains its existing `showCount` opt-in. The PHP
adapter populates existing event-teaser date spans and card image regions rather
than constructing parallel presentation markup.

Event and content listings share slider navigation, responsive refresh and teardown
in `src/components/_utils/listing-slider.js`. Their breakpoint defaults remain
component-specific; event listing also owns its HTMX setup.

The WordPress content-list adapter uses the router's server-side `restPath` to fetch
the custom listing endpoint, including installations in subdirectories. `cmsUrl`
is for public media URLs, not server-to-server requests. HTTP failures or malformed
responses are errors, not empty listings. Grid classes `grid-3` and `grid-4` select
three or four desktop columns; smaller breakpoints remain responsive.

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

Git and the package contain buildable source, not generated `dist` or duplicate
public font files. After `npm ci`, `npm run build` generates those locally.
There is no install-time build hook. Astro consumers compile source imports
directly, including workshop fixtures; WordPress plugin builds explicitly run
this package's build before copying its output into the release.
Canonical fonts remain under `src/design-tokens/fonts`; the build script copies them
to `public/assets`. The patched third-party slider archive in `vendor` is a
dependency input, not this project's generated output.

Commit/push source, then use `just wc-pin` from the meta repo to update both
consumers' Git lockfile pins. No tarball hosting, registry or extra publishing
step is needed. Version builds validate output but never stage it.

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
