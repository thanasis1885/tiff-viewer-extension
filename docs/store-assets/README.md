# Store Assets

Generator output folder for the Chrome Web Store listing.

When `tools/generate-store-assets.mjs` runs, it writes the following files here:
- `sample-archive-scan.tiff`
- `sample-archive-scan.png`
- `screenshot-viewer.png`
- `screenshot-inline-page.png`
- `screenshot-options.png`
- `promo-small-440x280.png`
- `promo-marquee-1400x560.png`

Regenerate everything with:

```powershell
$env:NODE_PATH='C:\Users\thana\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
& 'C:\Users\thana\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\tools\generate-store-assets.mjs'
```
