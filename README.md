# Transparent Events (Chrome + Firefox)

This project now supports both browsers from one codebase.

## Quick start

1. Pick target manifest:

```bash
./scripts/use-manifest.sh chrome
# or
./scripts/use-manifest.sh firefox
```

2. Load extension:

- Chrome:
  - Open `chrome://extensions`
  - Enable Developer mode
  - Click **Load unpacked**
  - Select this project folder

- Firefox:
  - Open `about:debugging#/runtime/this-firefox`
  - Click **Load Temporary Add-on...**
  - Select `manifest.json` in this project

## Build ZIP archives

Run:

```bash
chmod +x ./scripts/package-zips.sh
./scripts/package-zips.sh
```

Outputs:

- `dist/transparent-events-chrome.zip`
- `dist/transparent-events-firefox.zip`

## Files

- `manifests/chrome.json`: Chrome manifest template
- `manifests/firefox.json`: Firefox manifest template
- `scripts/use-manifest.sh`: Copies selected template to `manifest.json`
- `scripts/package-zips.sh`: Builds Chrome and Firefox ZIP archives

## Notes

- The JavaScript code uses a browser-agnostic API shim (`browser` if available, otherwise `chrome`).
- OAuth popup flow uses `identity.launchWebAuthFlow` in a way that supports both callback-based and Promise-based implementations.
- The Firefox target uses Manifest V2 with `background.scripts` for compatibility with Firefox builds where MV3 service workers are disabled.
