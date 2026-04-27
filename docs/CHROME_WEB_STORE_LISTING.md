# Chrome Web Store listing draft

## Published listing
TIFF Viewer is now live on the Chrome Web Store:

- `https://chromewebstore.google.com/detail/tiff-viewer/dldbfebnfnefnklickhbgefihbldljok`

## Recommended title
TIFF Viewer

This stays well inside the current Chrome extension name limit and keeps the original project identity.

## Recommended short description
Open TIFF/TIF images in Chromium browsers with inline page rendering and a dedicated Manifest V3 viewer.

This version fits within the current manifest description limit documented by Chrome.

## Recommended detailed description
TIFF Viewer restores TIFF and TIF support to Chromium-based browsers.

Open direct TIFF links, render TIFF images embedded in web pages, and keep decoding local inside the browser with a Manifest V3-compatible architecture.

Key features:
- Opens direct `.tif` and `.tiff` navigations in a dedicated extension viewer
- Replaces unsupported TIFF images inline when a page references them
- Keeps image decoding local in the browser instead of sending files to a remote conversion service
- Includes options for decoder memory limits and debug output

Why this version exists:
- The original TIFF Viewer extension relied on Chromium Manifest V2 behavior that no longer works in current Chrome-based browsers
- This continuation keeps the project working on modern Chromium while preserving clear attribution to the original project and contributors

Permissions and privacy:
- The extension requests broad host access so it can fetch and render the TIFF resource the user is opening
- Rendering happens locally inside the extension
- No cloud upload or external conversion service is required for the core feature

Attribution:
- Original project: `my-codeworks/tiff-viewer-extension`
- Chromium Manifest V3 continuation maintained in this fork

## Optional support copy
Support URL:
- GitHub issues page for the maintained fork

Homepage URL:
- repository homepage for the maintained fork

Published listing URL:
- `https://chromewebstore.google.com/detail/tiff-viewer/dldbfebnfnefnklickhbgefihbldljok`

## Suggested screenshots
- Direct TIFF navigation rendered in the dedicated viewer
- TIFF image displayed inline inside a normal web page
- Options page showing memory limit and debug settings

## Suggested release blurb
Manifest V3 continuation of TIFF Viewer for Chromium browsers, preserving local TIFF rendering with updated architecture and explicit upstream credit.
