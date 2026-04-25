const statusElement = document.getElementById("status");
const errorElement = document.getElementById("error");
const previewElement = document.getElementById("preview");
const metaElement = document.getElementById("meta");
const sourceLinkElement = document.getElementById("source-link");

function setStatus(text) {
  statusElement.textContent = text;
  statusElement.hidden = false;
}

function showError(text) {
  errorElement.textContent = text;
  errorElement.hidden = false;
  setStatus("The TIFF image could not be rendered.");
}

function getSourceUrlFromHash() {
  return window.location.hash ? window.location.hash.slice(1) : "";
}

async function renderCurrentTiff() {
  const sourceUrl = getSourceUrlFromHash();

  if (!sourceUrl) {
    showError("Missing original TIFF URL.");
    return;
  }

  sourceLinkElement.href = sourceUrl;
  sourceLinkElement.textContent = sourceUrl;
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

    previewElement.src = response.dataUrl;
    previewElement.hidden = false;
    statusElement.hidden = true;
    document.title = "TIFF Viewer";
  } catch (error) {
    showError(error instanceof Error ? error.message : String(error));
  }
}

renderCurrentTiff();
