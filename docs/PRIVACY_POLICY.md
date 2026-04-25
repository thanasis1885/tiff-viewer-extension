# Privacy Policy

TIFF Viewer is designed to render TIFF and TIF images locally inside the browser.

## What the extension does

- Opens direct TIFF and TIF navigations in an extension viewer
- Replaces unsupported TIFF images inline on web pages when needed
- Stores local extension settings such as decoder memory limits and debug preferences

## Data handling

- TIFF Viewer does not provide a cloud upload or remote conversion service
- TIFF decoding happens locally in the browser through the bundled extension code
- TIFF Viewer does not include analytics, advertising, or user tracking features
- TIFF Viewer does not sell personal information

## Permissions rationale

- Broad host access is used so the extension can detect and fetch TIFF resources that the user is already opening in the browser
- `webRequest` is used to detect TIFF responses from headers so the extension knows when a resource should be rendered
- `declarativeNetRequest` is used to redirect direct TIFF navigations into the built-in viewer
- `offscreen` is used to render TIFF files into displayable image data in a Manifest V3-compatible way
- `storage` is used only for local extension preferences
- `tabs` is used to update navigation to the internal viewer when required

## Data storage

The extension stores only local settings in Chrome extension storage:

- `DecoderMemoryLimitInMegabytes`
- `ShowDebugOutput`

## Contact

Project homepage:

- [https://github.com/thanasis1885/tiff-viewer-extension](https://github.com/thanasis1885/tiff-viewer-extension)

Support and issues:

- [https://github.com/thanasis1885/tiff-viewer-extension/issues](https://github.com/thanasis1885/tiff-viewer-extension/issues)
