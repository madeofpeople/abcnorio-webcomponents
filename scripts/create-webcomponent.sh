#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPONENTS_DIR="$ROOT_DIR/src/components"
PACKAGE_JSON_PATH="$ROOT_DIR/package.json"
BLOCK_REGISTRY_PATH="$ROOT_DIR/src/components/wp-blocks/block-registry.js"

usage() {
  echo "Usage: just create-webcomponent component-name [--scope components|wp-blocks] [--wp-block namespace/block]" >&2
}

COMPONENT_NAME="${1:-}"
shift || true

SCOPE="components"
WP_BLOCK_NAME=""

if [[ -z "$COMPONENT_NAME" ]]; then
  usage
  exit 1
fi

if [[ ! "$COMPONENT_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Invalid component name: $COMPONENT_NAME" >&2
  echo "Expected kebab-case like: event-card" >&2
  exit 1
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope)
      SCOPE="${2:-}"
      shift 2
      ;;
    --wp-block)
      WP_BLOCK_NAME="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ "$SCOPE" != "components" && "$SCOPE" != "wp-blocks" ]]; then
  echo "Invalid scope: $SCOPE" >&2
  echo "Expected one of: components, wp-blocks" >&2
  exit 1
fi

if [[ -n "$WP_BLOCK_NAME" && "$SCOPE" != "wp-blocks" ]]; then
  echo "--wp-block requires --scope wp-blocks" >&2
  exit 1
fi

if [[ "$SCOPE" == "wp-blocks" && -z "$WP_BLOCK_NAME" ]]; then
  echo "--scope wp-blocks requires --wp-block namespace/block" >&2
  exit 1
fi

if [[ -n "$WP_BLOCK_NAME" && ! "$WP_BLOCK_NAME" =~ ^[a-z0-9]+/[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Invalid wp block name: $WP_BLOCK_NAME" >&2
  echo "Expected namespace/block like: core/cover or abcnorio/announcement-tout" >&2
  exit 1
fi

if [[ "$SCOPE" == "wp-blocks" ]]; then
  TARGET_DIR="$COMPONENTS_DIR/wp-blocks/$COMPONENT_NAME"
else
  TARGET_DIR="$COMPONENTS_DIR/$COMPONENT_NAME"
fi

ASTRO_FILE="$TARGET_DIR/$COMPONENT_NAME.astro"
SCSS_FILE="$TARGET_DIR/$COMPONENT_NAME.scss"
JS_FILE="$TARGET_DIR/$COMPONENT_NAME.js"
FIXTURE_FILE="$TARGET_DIR/$COMPONENT_NAME.fixture.js"

if [[ -e "$TARGET_DIR" ]]; then
  echo "Component directory already exists: $TARGET_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

if [[ "$SCOPE" == "wp-blocks" ]]; then
  cat > "$ASTRO_FILE" <<EOF
---
import { Debug } from 'astro:components';

const props = Astro.props;
---

<Debug {...props} />

<script>
  import './$COMPONENT_NAME.js';
</script>

<style lang="scss">
  @use './$COMPONENT_NAME.scss';
</style>
EOF
else
  cat > "$ASTRO_FILE" <<EOF
---
import { Debug } from 'astro:components';

const props = Astro.props;
---

<Debug {...props} />

<script>
  import './$COMPONENT_NAME.js';
</script>

<style lang="scss">
  @use './$COMPONENT_NAME.scss';
</style>
EOF
fi

cat > "$SCSS_FILE" <<'EOF'
/* Component styles */
EOF

cat > "$JS_FILE" <<'EOF'
// Component behavior
EOF

cat > "$FIXTURE_FILE" <<'EOF'
export const metadata = {
  deps: {
    css: [],
    js: [],
  },
};

export default {
  default: {
    props: {},
  },
};
EOF

PACKAGE_JSON_PATH="$PACKAGE_JSON_PATH" SCOPE="$SCOPE" COMPONENT_NAME="$COMPONENT_NAME" node --input-type=module <<'EOF'
import fs from 'node:fs';

const packageJsonPath = process.env.PACKAGE_JSON_PATH;
const scope = process.env.SCOPE;
const componentName = process.env.COMPONENT_NAME;

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const exportsMap = packageJson.exports ?? {};

const exportPrefix = scope === 'wp-blocks' ? `./wp-blocks/${componentName}` : `./${componentName}`;
const astroExport = scope === 'wp-blocks'
  ? `./src/components/wp-blocks/${componentName}/${componentName}.astro`
  : `./src/components/${componentName}/${componentName}.astro`;
const jsExport = scope === 'wp-blocks'
  ? `./src/components/wp-blocks/${componentName}/${componentName}.js`
  : `./src/components/${componentName}/${componentName}.js`;

for (const key of [exportPrefix, `${exportPrefix}/element`]) {
  if (Object.prototype.hasOwnProperty.call(exportsMap, key)) {
    throw new Error(`Export already exists: ${key}`);
  }
}

exportsMap[exportPrefix] = astroExport;
exportsMap[`${exportPrefix}/element`] = jsExport;
packageJson.exports = exportsMap;

fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
EOF

if [[ "$SCOPE" == "wp-blocks" ]]; then
  BLOCK_REGISTRY_PATH="$BLOCK_REGISTRY_PATH" COMPONENT_NAME="$COMPONENT_NAME" WP_BLOCK_NAME="$WP_BLOCK_NAME" node --input-type=module <<'EOF'
import fs from 'node:fs';

const registryPath = process.env.BLOCK_REGISTRY_PATH;
const componentName = process.env.COMPONENT_NAME;
const wpBlockName = process.env.WP_BLOCK_NAME;

const toPascalCase = (value) => value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
const componentClassName = `${toPascalCase(componentName)}Block`;
const keyConstant = componentName.toUpperCase().replace(/-/g, '_');

const source = fs.readFileSync(registryPath, 'utf8');

if (source.includes(`  ${keyConstant}: `)) {
  throw new Error(`Block registry already contains constant: ${keyConstant}`);
}

if (source.includes(`'${wpBlockName}'`) || source.includes(`"${wpBlockName}"`)) {
  throw new Error(`Block registry already contains key: ${wpBlockName}`);
}

const importLine = `import ${componentClassName} from './${componentName}/${componentName}.astro';`;
if (source.includes(importLine)) {
  throw new Error(`Block registry already contains import for: ${componentName}`);
}

const importAnchor = "import MatterportEmbed from './matterport/matterport.astro';\n";
if (!source.includes(importAnchor)) {
  throw new Error('Block registry import anchor missing.');
}

let nextSource = source.replace(importAnchor, `${importAnchor}${importLine}\n`);

if (wpBlockName.startsWith('core/')) {
  const keyAnchor = "  COVER: 'core/cover',\n";
  const registryAnchor = "  [CORE_BLOCK_KEYS.COVER]: CoverBlock,\n";

  if (!nextSource.includes(keyAnchor) || !nextSource.includes(registryAnchor)) {
    throw new Error('Core block registry anchors missing.');
  }

  nextSource = nextSource.replace(
    keyAnchor,
    `${keyAnchor}  ${keyConstant}: '${wpBlockName}',\n`
  );

  nextSource = nextSource.replace(
    registryAnchor,
    `${registryAnchor}  [CORE_BLOCK_KEYS.${keyConstant}]: ${componentClassName},\n`
  );
} else {
  const keyAnchor = "  SIDEBAR_TOUT: 'abcnorio/sidebar-tout',\n";
  const registryAnchor = "  [CUSTOM_BLOCK_KEYS.SIDEBAR_TOUT]: SidebarToutBlock,\n";

  if (!nextSource.includes(keyAnchor) || !nextSource.includes(registryAnchor)) {
    throw new Error('Custom block registry anchors missing.');
  }

  nextSource = nextSource.replace(
    keyAnchor,
    `${keyAnchor}  ${keyConstant}: '${wpBlockName}',\n`
  );

  nextSource = nextSource.replace(
    registryAnchor,
    `${registryAnchor}  [CUSTOM_BLOCK_KEYS.${keyConstant}]: ${componentClassName},\n`
  );
}

fs.writeFileSync(registryPath, nextSource);
EOF
fi

echo "Created component scaffold:"
echo "  $TARGET_DIR"
echo "  $ASTRO_FILE"
echo "  $SCSS_FILE"
echo "  $JS_FILE"
echo "  $FIXTURE_FILE"
echo
echo "Updated package.json exports automatically."
if [[ "$SCOPE" == "wp-blocks" ]]; then
  echo "Updated block registry automatically for: $WP_BLOCK_NAME"
fi