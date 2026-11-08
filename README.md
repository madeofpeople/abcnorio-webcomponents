# abcnorio-webcomponents

Shared Astro components and fixtures for the frontend and WordPress editor.

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
