#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPONENTS_DIR="$ROOT_DIR/src/components"

COMPONENT_NAME="${1:-}"

if [[ -z "$COMPONENT_NAME" ]]; then
  echo "Usage: just create-webcomponent component-name" >&2
  exit 1
fi

if [[ ! "$COMPONENT_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Invalid component name: $COMPONENT_NAME" >&2
  echo "Expected kebab-case like: event-card" >&2
  exit 1
fi

TARGET_DIR="$COMPONENTS_DIR/$COMPONENT_NAME"
ASTRO_FILE="$TARGET_DIR/$COMPONENT_NAME.astro"
SCSS_FILE="$TARGET_DIR/$COMPONENT_NAME.scss"
JS_FILE="$TARGET_DIR/$COMPONENT_NAME.js"
FIXTURE_FILE="$TARGET_DIR/$COMPONENT_NAME.fixture.js"

if [[ -e "$TARGET_DIR" ]]; then
  echo "Component directory already exists: $TARGET_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

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

echo "Created component scaffold:" 
echo "  $TARGET_DIR"
echo "  $ASTRO_FILE"
echo "  $SCSS_FILE"
echo "  $JS_FILE"
echo "  $FIXTURE_FILE"
echo
echo "Next: add exports in package.json (not auto-updated)."
echo "Add these entries under exports:"
echo "  \"./$COMPONENT_NAME\": \"./src/components/$COMPONENT_NAME/$COMPONENT_NAME.astro\","
echo "  \"./$COMPONENT_NAME/element\": \"./src/components/$COMPONENT_NAME/$COMPONENT_NAME.js\","