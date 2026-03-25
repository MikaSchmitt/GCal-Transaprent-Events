#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

mkdir -p "$DIST_DIR"

package_target() {
  local target="$1"
  local output_zip="$DIST_DIR/transparent-events-${target}.zip"

  "$ROOT_DIR/scripts/use-manifest.sh" "$target" >/dev/null

  rm -f "$output_zip"
  (
    cd "$ROOT_DIR"
    zip -r "$output_zip" \
      manifest.json \
      background.js \
      content.js \
      auth \
      google-callback \
      icon_16.png \
      icon_32.png \
      icon_48.png \
      icon_128.png \
      -x "*.git*" "dist/*" >/dev/null
  )

  echo "Created: $output_zip"
}

package_target chrome
package_target firefox

# Default back to Chrome manifest for local unpacked loading.
"$ROOT_DIR/scripts/use-manifest.sh" chrome >/dev/null

echo "Done. Archives are in: $DIST_DIR"
