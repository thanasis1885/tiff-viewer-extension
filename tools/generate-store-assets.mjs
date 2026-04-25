import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const repoRoot = path.resolve(
  "C:/Users/thana/OneDrive/Ai Projects/Tiff Extension/tiff-viewer-extension-master"
);
const outputDir = path.join(repoRoot, "docs", "store-assets");
const extensionDir = path.join(repoRoot, "chrome-mv3");
const iconPath = path.join(extensionDir, "icon128.png");
const previewPngPath = path.join(outputDir, "sample-archive-scan.png");
const previewTiffPath = path.join(outputDir, "sample-archive-scan.tiff");
const viewerScreenshotPath = path.join(outputDir, "screenshot-viewer.png");
const inlineScreenshotPath = path.join(outputDir, "screenshot-inline-page.png");
const optionsScreenshotPath = path.join(outputDir, "screenshot-options.png");
const promoTilePath = path.join(outputDir, "promo-small-440x280.png");
const marqueeTilePath = path.join(outputDir, "promo-marquee-1400x560.png");

const browserFrame = {
  x: 72,
  y: 70,
  width: 1136,
  height: 658,
  radius: 26
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function roundedRectPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M ${x + r} ${y}`,
    `H ${x + width - r}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `V ${y + height - r}`,
    `Q ${x + width} ${y + height} ${x + width - r} ${y + height}`,
    `H ${x + r}`,
    `Q ${x} ${y + height} ${x} ${y + height - r}`,
    `V ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    "Z"
  ].join(" ");
}

async function ensureOutputDir() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function loadIconBuffer() {
  return sharp(iconPath).resize(96, 96).png().toBuffer();
}

async function createSamplePreview() {
  const sampleSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f6f1e4"/>
          <stop offset="56%" stop-color="#efe5ce"/>
          <stop offset="100%" stop-color="#d7d4cd"/>
        </linearGradient>
        <linearGradient id="photo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#365c73"/>
          <stop offset="100%" stop-color="#8da8a1"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="760" fill="url(#bg)"/>
      <rect x="74" y="74" width="1052" height="612" rx="26" fill="#f8f4ea" stroke="#b79d72" stroke-width="6"/>
      <rect x="110" y="110" width="980" height="98" rx="18" fill="#e8dcc4"/>
      <text x="142" y="160" font-family="Georgia, serif" font-size="42" fill="#4c3f30">Municipal Archive</text>
      <text x="142" y="192" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#7c6d56">Restored scan, catalog item 1937-14</text>
      <rect x="110" y="236" width="420" height="382" rx="22" fill="url(#photo)"/>
      <circle cx="248" cy="340" r="92" fill="#f2dfb4" opacity="0.88"/>
      <path d="M145 555 C255 450 362 422 486 312" fill="none" stroke="#f7f2e8" stroke-width="16" stroke-linecap="round"/>
      <rect x="570" y="248" width="470" height="352" rx="22" fill="#fffaf0" stroke="#d9cab0" stroke-width="4"/>
      <text x="610" y="315" font-family="Georgia, serif" font-size="32" fill="#3c342b">Inspection Notes</text>
      <text x="610" y="365" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#5d564c">Condition: stable</text>
      <text x="610" y="405" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#5d564c">Ink density: medium</text>
      <text x="610" y="445" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#5d564c">Scanned from archival TIFF</text>
      <text x="610" y="485" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#5d564c">Preservation copy retained locally</text>
      <rect x="610" y="522" width="202" height="44" rx="22" fill="#0e7a6d"/>
      <text x="648" y="551" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#ffffff">Local render</text>
    </svg>
  `;

  const svgBuffer = Buffer.from(sampleSvg);

  await sharp(svgBuffer).png().toFile(previewPngPath);
  await sharp(svgBuffer).tiff({ compression: "lzw" }).toFile(previewTiffPath);

  return sharp(previewPngPath).resize(870, 510, { fit: "inside" }).png().toBuffer();
}

function createBrowserBase({ address, title, bodyMarkup, topRightPill }) {
  const framePath = roundedRectPath(
    browserFrame.x,
    browserFrame.y,
    browserFrame.width,
    browserFrame.height,
    browserFrame.radius
  );

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
      <defs>
        <linearGradient id="pageBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbf7ef"/>
          <stop offset="54%" stop-color="#eef1f4"/>
          <stop offset="100%" stop-color="#dfe8ec"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#20313a" flood-opacity="0.16"/>
        </filter>
      </defs>
      <rect width="1280" height="800" fill="url(#pageBg)"/>
      <path d="${framePath}" fill="#ffffff" filter="url(#shadow)"/>
      <rect x="${browserFrame.x}" y="${browserFrame.y}" width="${browserFrame.width}" height="82" rx="${browserFrame.radius}" fill="#f3f6f8"/>
      <circle cx="116" cy="111" r="8" fill="#ff6259"/>
      <circle cx="142" cy="111" r="8" fill="#ffbe2f"/>
      <circle cx="168" cy="111" r="8" fill="#28c840"/>
      <rect x="218" y="92" width="724" height="38" rx="19" fill="#ffffff" stroke="#d7dde3"/>
      <text x="242" y="116" font-family="Segoe UI, Arial, sans-serif" font-size="19" fill="#55636f">${escapeHtml(address)}</text>
      <rect x="972" y="92" width="180" height="38" rx="19" fill="#edf6f3"/>
      <text x="1002" y="116" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#0f7b6f">${escapeHtml(topRightPill)}</text>
      <text x="96" y="163" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#7a8792">${escapeHtml(title)}</text>
      ${bodyMarkup}
    </svg>
  `;
}

async function createViewerScreenshot(iconBuffer, previewBuffer) {
  const bodySvg = createBrowserBase({
    address: "chrome-extension://tiff-viewer/viewer/viewer.html#http://127.0.0.1:38123/sample-archive-scan.tiff",
    title: "Direct TIFF navigation",
    topRightPill: "Manifest V3 viewer",
    bodyMarkup: `
      <rect x="96" y="196" width="1088" height="506" rx="30" fill="rgba(255,255,255,0.58)"/>
      <text x="208" y="250" font-family="Segoe UI, Arial, sans-serif" font-size="16" letter-spacing="4" fill="#0e7a6d">CHROMIUM MANIFEST V3 VIEWER</text>
      <text x="208" y="294" font-family="Georgia, serif" font-size="50" fill="#1f2a33">TIFF Viewer</text>
      <text x="208" y="329" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#5b6a76">Rendering the requested TIFF locally inside the extension.</text>
      <rect x="118" y="350" width="1044" height="314" rx="28" fill="#ffffff" stroke="#dde4e7"/>
      <text x="156" y="394" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#667682">Rendered TIFF output</text>
      <rect x="840" y="612" width="280" height="34" rx="17" fill="#eef7f5"/>
      <text x="866" y="634" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#0e7a6d">Original request preserved</text>
      <rect x="156" y="612" width="624" height="26" rx="13" fill="#f4f6f8"/>
      <text x="172" y="630" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#52616e">http://127.0.0.1:38123/sample-archive-scan.tiff</text>
    `
  });

  await sharp(Buffer.from(bodySvg))
    .composite([
      { input: iconBuffer, left: 104, top: 214 },
      {
        input: await sharp(previewBuffer)
          .resize(760, 190, { fit: "inside" })
          .png()
          .toBuffer(),
        left: 258,
        top: 422
      }
    ])
    .png()
    .toFile(viewerScreenshotPath);
}

async function createInlineScreenshot(previewBuffer) {
  const bodySvg = createBrowserBase({
    address: "http://127.0.0.1:38123/inline-demo.html",
    title: "Inline TIFF rendering inside a normal web page",
    topRightPill: "Inline image replacement",
    bodyMarkup: `
      <rect x="96" y="196" width="720" height="482" rx="28" fill="#ffffff" stroke="#dde4e7"/>
      <rect x="852" y="196" width="332" height="482" rx="28" fill="#f9fbfc" stroke="#dde4e7"/>
      <text x="132" y="252" font-family="Georgia, serif" font-size="42" fill="#1f2a33">Archive Scan Notes</text>
      <text x="132" y="290" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#60707c">This page embeds a TIFF image directly in the document flow.</text>
      <text x="132" y="324" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#60707c">Chromium does not render it by default, so TIFF Viewer swaps in a local render.</text>
      <rect x="132" y="364" width="648" height="280" rx="24" fill="#f3f6f7" stroke="#d6dde2"/>
      <text x="888" y="250" font-family="Georgia, serif" font-size="34" fill="#23303a">TIFF Viewer</text>
      <text x="888" y="288" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#64727d">Rendered inline on the page</text>
      <rect x="888" y="326" width="244" height="42" rx="21" fill="#0e7a6d"/>
      <text x="922" y="353" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="700" fill="#ffffff">No remote conversion</text>
      <text x="888" y="418" font-family="Segoe UI, Arial, sans-serif" font-size="19" fill="#4a5965">- Detects TIFF image URLs</text>
      <text x="888" y="454" font-family="Segoe UI, Arial, sans-serif" font-size="19" fill="#4a5965">- Preserves page layout</text>
      <text x="888" y="490" font-family="Segoe UI, Arial, sans-serif" font-size="19" fill="#4a5965">- Uses local decoder output</text>
      <text x="888" y="526" font-family="Segoe UI, Arial, sans-serif" font-size="19" fill="#4a5965">- Works with Manifest V3</text>
      <rect x="888" y="566" width="240" height="88" rx="18" fill="#eef7f5"/>
      <text x="910" y="600" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#0e7a6d">Typical use case:</text>
      <text x="910" y="626" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#49616a">document systems, scans,</text>
      <text x="910" y="648" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#49616a">municipal archives</text>
      <text x="132" y="652" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#677783">The image above is shown inline after the extension renders the TIFF locally.</text>
    `
  });

  await sharp(Buffer.from(bodySvg))
    .composite([
      {
        input: await sharp(previewBuffer)
          .resize(620, 244, { fit: "inside" })
          .png()
          .toBuffer(),
        left: 222,
        top: 382
      }
    ])
    .png()
    .toFile(inlineScreenshotPath);
}

async function createOptionsScreenshot(iconBuffer) {
  const bodySvg = createBrowserBase({
    address: "chrome-extension://tiff-viewer/options/options.html",
    title: "Extension settings",
    topRightPill: "Stored locally",
    bodyMarkup: `
      <rect x="168" y="214" width="948" height="472" rx="28" fill="#ffffff" stroke="#dde4e7"/>
      <text x="288" y="284" font-family="Georgia, serif" font-size="46" fill="#1f2a33">TIFF Viewer Options</text>
      <text x="288" y="322" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#62707b">Control decoder memory limits and optional debug output.</text>
      <text x="288" y="400" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#53616d">Maximum available decoding memory in Megabytes</text>
      <rect x="288" y="420" width="354" height="58" rx="16" fill="#f5f7f9" stroke="#d9e0e5"/>
      <text x="316" y="456" font-family="Segoe UI, Arial, sans-serif" font-size="23" fill="#27333d">32 MB</text>
      <path d="M604 442 L620 442 L612 454 Z" fill="#5e6d78"/>
      <rect x="288" y="516" width="28" height="28" rx="7" fill="#0e7a6d"/>
      <path d="M295 530 L301 536 L312 521" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="332" y="537" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#53616d">Show console debug messages.</text>
      <rect x="288" y="590" width="144" height="50" rx="16" fill="#0e7a6d"/>
      <text x="336" y="622" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#ffffff">Save</text>
      <rect x="452" y="590" width="158" height="50" rx="16" fill="#edf1f4"/>
      <text x="495" y="622" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#374652">Default</text>
      <rect x="754" y="378" width="282" height="214" rx="22" fill="#f9fbfc" stroke="#dde4e7"/>
      <text x="786" y="422" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#0e7a6d">Why these options matter</text>
      <text x="786" y="458" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#4a5965">- Tune decoding for larger TIFF files</text>
      <text x="786" y="492" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#4a5965">- Keep defaults for normal browsing</text>
      <text x="786" y="526" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#4a5965">- Enable debug output only when needed</text>
      <rect x="754" y="552" width="178" height="28" rx="14" fill="#eef7f5"/>
      <text x="774" y="571" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#0e7a6d">chrome.storage.local</text>
    `
  });

  await sharp(Buffer.from(bodySvg))
    .composite([{ input: iconBuffer, left: 186, top: 236 }])
    .png()
    .toFile(optionsScreenshotPath);
}

async function createSmallPromoTile(iconBuffer, previewBuffer) {
  const backgroundSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8efe2"/>
          <stop offset="55%" stop-color="#e8f0f2"/>
          <stop offset="100%" stop-color="#d6e3df"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#20313a" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="440" height="280" rx="28" fill="url(#bg)"/>
      <rect x="208" y="34" width="196" height="212" rx="22" fill="#ffffff" filter="url(#shadow)"/>
      <text x="128" y="76" font-family="Georgia, serif" font-size="32" fill="#1f2a33">TIFF Viewer</text>
      <text x="32" y="118" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#5f6f7b">Manifest V3 continuation</text>
      <text x="32" y="148" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#5f6f7b">for Chromium browsers</text>
      <rect x="32" y="178" width="148" height="34" rx="17" fill="#0e7a6d"/>
      <text x="54" y="200" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" fill="#ffffff">Local rendering</text>
      <rect x="32" y="224" width="104" height="26" rx="13" fill="#eef7f5"/>
      <text x="47" y="241" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#0e7a6d">Open TIF/TIFF</text>
    </svg>
  `;

  await sharp(Buffer.from(backgroundSvg))
    .composite([
      { input: await sharp(iconBuffer).resize(84, 84).png().toBuffer(), left: 32, top: 26 },
      { input: await sharp(previewBuffer).resize(164, 112, { fit: "cover" }).png().toBuffer(), left: 224, top: 104 }
    ])
    .png()
    .toFile(promoTilePath);
}

async function createMarqueeTile(iconBuffer, previewBuffer) {
  const backgroundSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="560" viewBox="0 0 1400 560">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f7eee0"/>
          <stop offset="52%" stop-color="#ecf1f4"/>
          <stop offset="100%" stop-color="#d8e4df"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#20313a" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="1400" height="560" fill="url(#bg)"/>
      <rect x="822" y="72" width="490" height="416" rx="30" fill="#ffffff" filter="url(#shadow)"/>
      <text x="288" y="166" font-family="Georgia, serif" font-size="76" fill="#1f2a33">TIFF Viewer</text>
      <text x="142" y="224" font-family="Segoe UI, Arial, sans-serif" font-size="32" fill="#5e6d78">Manifest V3 continuation for Chromium browsers</text>
      <text x="142" y="288" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#45545f">Open direct TIFF links, render TIFF images inline,</text>
      <text x="142" y="328" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#45545f">and keep decoding local inside the browser.</text>
      <rect x="142" y="382" width="218" height="52" rx="26" fill="#0e7a6d"/>
      <text x="184" y="416" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff">Open TIF/TIFF</text>
      <rect x="380" y="382" width="194" height="52" rx="26" fill="#eef7f5"/>
      <text x="422" y="416" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#0e7a6d">Local rendering</text>
    </svg>
  `;

  await sharp(Buffer.from(backgroundSvg))
    .composite([
      { input: await sharp(iconBuffer).resize(112, 112).png().toBuffer(), left: 142, top: 66 },
      { input: await sharp(previewBuffer).resize(430, 286, { fit: "cover" }).png().toBuffer(), left: 852, top: 152 }
    ])
    .png()
    .toFile(marqueeTilePath);
}

async function writeReadme() {
  const readme = `# Store Assets

Generator output folder for the Chrome Web Store listing.

When \`tools/generate-store-assets.mjs\` runs, it writes the following files here:
- \`sample-archive-scan.tiff\`
- \`sample-archive-scan.png\`
- \`screenshot-viewer.png\`
- \`screenshot-inline-page.png\`
- \`screenshot-options.png\`
- \`promo-small-440x280.png\`
- \`promo-marquee-1400x560.png\`

Regenerate everything with:

\`\`\`powershell
$env:NODE_PATH='C:\\Users\\thana\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules'
& 'C:\\Users\\thana\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe' '.\\tools\\generate-store-assets.mjs'
\`\`\`
`;

  await fs.writeFile(path.join(outputDir, "README.md"), readme);
}

async function main() {
  await ensureOutputDir();

  const [iconBuffer, previewBuffer] = await Promise.all([
    loadIconBuffer(),
    createSamplePreview()
  ]);

  await Promise.all([
    createViewerScreenshot(iconBuffer, previewBuffer),
    createInlineScreenshot(previewBuffer),
    createOptionsScreenshot(iconBuffer),
    createSmallPromoTile(iconBuffer, previewBuffer),
    createMarqueeTile(iconBuffer, previewBuffer)
  ]);

  await writeReadme();

  console.log(`Generated store assets in ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
