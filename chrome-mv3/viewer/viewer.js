const statusElement = document.getElementById("status");
const errorElement = document.getElementById("error");
const previewElement = document.getElementById("preview");
const viewportElement = document.getElementById("viewport");
const controlsElement = document.getElementById("controls");
const metaElement = document.getElementById("meta");
const sourceLinkElement = document.getElementById("source-link");
const openSourceElement = document.getElementById("open-source");
const zoomReadoutElement = document.getElementById("zoom-readout");
const zoomOutButton = document.getElementById("zoom-out");
const zoomInButton = document.getElementById("zoom-in");
const fitWidthButton = document.getElementById("fit-width");
const actualSizeButton = document.getElementById("actual-size");

const zoomState = {
  naturalWidth: 0,
  zoom: 1,
  mode: "fit-width"
};

function setStatus(text) {
  statusElement.textContent = text;
  statusElement.hidden = false;
}

function showError(text) {
  errorElement.textContent = text;
  errorElement.hidden = false;
  controlsElement.hidden = true;
  viewportElement.hidden = true;
  setStatus("The TIFF image could not be rendered.");
}

function getSourceUrlFromHash() {
  return window.location.hash ? window.location.hash.slice(1) : "";
}

function clampZoom(zoom) {
  return Math.min(4, Math.max(0.15, zoom));
}

function updateModeButtons() {
  fitWidthButton.classList.toggle("is-active", zoomState.mode === "fit-width");
  actualSizeButton.classList.toggle("is-active", zoomState.mode === "actual-size");
}

function applyZoom() {
  if (!zoomState.naturalWidth) {
    return;
  }

  previewElement.style.width = `${Math.round(zoomState.naturalWidth * zoomState.zoom)}px`;
  zoomReadoutElement.textContent = `${Math.round(zoomState.zoom * 100)}%`;
  updateModeButtons();
}

function setZoom(zoom, mode) {
  zoomState.zoom = clampZoom(zoom);
  zoomState.mode = mode;
  applyZoom();
}

function fitPreviewToWidth() {
  if (!zoomState.naturalWidth) {
    return;
  }

  const availableWidth = Math.max(240, viewportElement.clientWidth - 36);
  setZoom(availableWidth / zoomState.naturalWidth, "fit-width");
}

function zoomIn() {
  setZoom(zoomState.zoom * 1.15, "manual");
}

function zoomOut() {
  setZoom(zoomState.zoom / 1.15, "manual");
}

function showActualSize() {
  setZoom(1, "actual-size");
}

function handlePreviewLoaded() {
  zoomState.naturalWidth = previewElement.naturalWidth || previewElement.width;

  previewElement.hidden = false;
  viewportElement.hidden = false;
  controlsElement.hidden = false;
  statusElement.hidden = true;

  fitPreviewToWidth();
  document.title = "TIFF Viewer";
}

async function renderCurrentTiff() {
  const sourceUrl = getSourceUrlFromHash();

  if (!sourceUrl) {
    showError("Missing original TIFF URL.");
    return;
  }

  sourceLinkElement.href = sourceUrl;
  sourceLinkElement.textContent = sourceUrl;
  openSourceElement.href = sourceUrl;
  metaElement.hidden = false;

  setStatus("Fetching and decoding the TIFF image...");

  try {
    const response = await chrome.runtime.sendMessage({
      type: "render-tiff",
      url: sourceUrl,
      force: true
    });

    if (!response || response.ok !== true || !response.dataUrl) {
      throw new Error(
        response && response.error
          ? response.error
          : "The extension could not decode this TIFF."
      );
    }

    previewElement.addEventListener("load", handlePreviewLoaded, { once: true });
    previewElement.src = response.dataUrl;
  } catch (error) {
    showError(error instanceof Error ? error.message : String(error));
  }
}

zoomOutButton.addEventListener("click", zoomOut);
zoomInButton.addEventListener("click", zoomIn);
fitWidthButton.addEventListener("click", fitPreviewToWidth);
actualSizeButton.addEventListener("click", showActualSize);

window.addEventListener("resize", () => {
  if (zoomState.mode === "fit-width") {
    fitPreviewToWidth();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    zoomIn();
    return;
  }

  if (event.key === "-") {
    event.preventDefault();
    zoomOut();
    return;
  }

  if (event.key === "0") {
    event.preventDefault();
    showActualSize();
    return;
  }

  if (event.key.toLowerCase() === "w") {
    event.preventDefault();
    fitPreviewToWidth();
  }
});

renderCurrentTiff();
