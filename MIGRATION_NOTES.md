# Chromium MV3 migration notes

## Why this fork exists
The upstream extension was built around Chrome's Manifest V2 model:

1. a persistent background page
2. blocking `webRequest` listeners
3. synchronous `XMLHttpRequest`
4. direct request redirection to a generated `data:` URL

That design kept working in Firefox for much longer, but Chromium removed practical support for this model when Manifest V2 was deprecated and disabled. As a result, the original extension stopped working in Chrome-based browsers and disappeared from normal Chrome Web Store use.

## What changed in this fork
The Chromium-specific build was reworked into a Manifest V3 package under `chrome-mv3/`.

### Old flow
1. intercept TIFF request in a blocking background page
2. synchronously fetch the TIFF bytes
3. decode through the bundled libtiff port
4. redirect the browser request to a generated `data:image` URL

### New flow
1. redirect direct `.tif` and `.tiff` navigations to an internal viewer page with Declarative Net Request
2. observe TIFF responses with `webRequest` response headers to detect content-type based TIFF resources
3. use a service worker as the control plane instead of a persistent background page
4. decode TIFF files inside an offscreen document that loads the existing `tiff.min.js` library
5. replace broken TIFF `<img>` elements in page content through a content script
6. keep options in extension storage and pass renderer settings from the service worker to the offscreen decoder

## Key files
- `chrome-mv3/manifest.json`: Manifest V3 package definition
- `chrome-mv3/background.js`: service worker routing and render orchestration
- `chrome-mv3/offscreen.js`: offscreen TIFF decoding runtime
- `chrome-mv3/content/image-handler.js`: inline page image replacement
- `chrome-mv3/viewer/viewer.html`: direct navigation viewer
- `chrome-mv3/options/options.js`: options save flow updated for MV3 runtime boundaries

## What did not change
- The extension still uses the bundled `tiff.min.js` decoder from upstream.
- Existing decoding limits from the libtiff port still apply.
- Memory tuning still happens through the options page.
- The project still aims to render TIFFs locally in the browser rather than sending them to a server.

## Known tradeoffs
- The MV3 build cannot preserve the old "block every request and synchronously rewrite it" model because Chromium no longer allows that architecture.
- Direct TIFF navigations are now handled by an internal viewer page.
- Inline image handling is now best-effort for content-type detected TIFFs and explicit `.tif` or `.tiff` URLs.

## Validation performed
- unpacked Chromium load test
- direct TIFF rendering test against a real network URL
- syntax checks for `background.js`, `offscreen.js`, `content/image-handler.js`, and `viewer/viewer.js`
- manifest JSON validation
