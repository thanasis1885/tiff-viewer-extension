# TIFF Viewer for Chromium
This directory contains the maintained Manifest V3 package for Chromium-based browsers.

## Package status
- Target runtime: Chrome, Edge, and other Chromium browsers with MV3 support
- Package version: `2.0.1`
- Repository home: `thanasis1885/tiff-viewer-extension`
- Chrome Web Store: [TIFF Viewer](https://chromewebstore.google.com/detail/tiff-viewer/dldbfebnfnefnklickhbgefihbldljok)

## Load unpacked
1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select this `chrome-mv3` directory

## What changed from upstream
- Replaced the persistent background page with a service worker
- Moved TIFF decoding into an offscreen document
- Added a dedicated viewer page for direct TIFF navigations
- Added a content script for inline TIFF replacement on pages
- Kept the original TIFF decoder and options model where practical

## Included files
- `manifest.json`: Manifest V3 package definition
- `background.js`: routing and render orchestration
- `offscreen.js`: TIFF decoding runtime
- `content/image-handler.js`: inline page image replacement
- `viewer/`: dedicated direct-view experience
- `options/`: decoder memory and debug settings

## Notes for maintainers
- `homepage_url` points to the maintained fork rather than the abandoned store entry
- The root repository README explains attribution and project scope
- Technical migration details live in `../MIGRATION_NOTES.md`

## License
MIT, with original copyright retained per upstream license terms.
