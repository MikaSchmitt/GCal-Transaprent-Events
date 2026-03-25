#!/usr/bin/env bash
set -euo pipefail

target="${1:-}"

if [[ -z "$target" ]]; then
  echo "Usage: scripts/use-manifest.sh <chrome|firefox>"
  exit 1
fi

case "$target" in
  chrome)
    cp manifests/chrome.json manifest.json
    ;;
  firefox)
    cp manifests/firefox.json manifest.json
    ;;
  *)
    echo "Unknown target: $target"
    echo "Usage: scripts/use-manifest.sh <chrome|firefox>"
    exit 1
    ;;
esac

echo "manifest.json now targets: $target"
