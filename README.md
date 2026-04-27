# TIFF Viewer Extension
Chromium Manifest V3 continuation of the original TIFF Viewer extension by `my codeworks`.

This fork keeps the project usable on current Chromium browsers after the original Chrome-compatible Manifest V2 architecture stopped working.

## Project status
- Maintained Chromium build: `chrome-mv3/`
- Historical upstream MV2 source retained at the repository root
- Current Chromium package version: `2.0.1`
- Chrome Web Store listing: [TIFF Viewer](https://chromewebstore.google.com/detail/tiff-viewer/dldbfebnfnefnklickhbgefihbldljok)

## Why this fork exists
The original extension depended on a persistent background page, blocking `webRequest`, and synchronous `XMLHttpRequest`. That model survived longer in Firefox, but Chromium's Manifest V2 deprecation removed the path that made the old Chrome build work.

This continuation keeps the original idea alive while staying explicit about what changed, why it changed, and where the original work came from.

## What is in this repository
- `chrome-mv3/`: the maintained Chromium package
- `MIGRATION_NOTES.md`: technical breakdown of the MV2 to MV3 migration
- `docs/CHROME_WEB_STORE_LISTING.md`: store-ready listing copy and publishing notes
- `docs/releases/2.0.1.md`: release notes draft for the public fork launch

## Quick start
1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select the `chrome-mv3` directory

## Current Chromium behavior
- Direct `.tif` and `.tiff` navigations open in a dedicated extension viewer
- Inline TIFF images are replaced in-page when Chromium cannot render them natively
- Rendering stays local inside the browser using the bundled TIFF decoder
- The options page still allows decoder memory tuning and debug output

## Known limitations
- The Chromium build still uses the bundled `tiff.min.js` decoder from upstream
- Existing decoder limits from the libtiff port still apply
- JPEG-compressed TIFF support is still limited by the upstream decoder build
- Some content-type-only inline TIFF cases are best-effort under MV3

## Credit
Full credit for the original extension, concept, and historical implementation goes to the original author and contributors.

- Original repository: [my-codeworks/tiff-viewer-extension](https://github.com/my-codeworks/tiff-viewer-extension)
- Original author: `my codeworks`
- Existing upstream contributor credit: [Paul Heil](https://github.com/Pheil) for pull requests updating the TIFF library and adding the options page
- TIFF decoding library credit: [Seikichi's tiff.js](https://github.com/seikichi/tiff.js/tree/master)

This continuation is maintenance work on top of the original project, not a claim of authorship over the original extension.

## Related notes
- Migration notes: [MIGRATION_NOTES.md](MIGRATION_NOTES.md)
- Chrome Web Store copy: [docs/CHROME_WEB_STORE_LISTING.md](docs/CHROME_WEB_STORE_LISTING.md)
- Release notes draft: [docs/releases/2.0.1.md](docs/releases/2.0.1.md)

## License
MIT. See [LICENSE](LICENSE).
