const TIFF_VIEWER_PROCESSED_SOURCE_ATTRIBUTE = "data-tiff-viewer-source";
const TIFF_VIEWER_PENDING_ATTRIBUTE = "data-tiff-viewer-pending";

function isLikelyTiffUrl(url) {
  return /^(?:https?|file):\/\/.+\.tiff?(?:[?#].*)?$/i.test(url);
}

function isProcessableUrl(url) {
  return (
    typeof url === "string" &&
    url.length > 0 &&
    !url.startsWith("blob:") &&
    !url.startsWith("chrome-extension:") &&
    !url.startsWith("data:") &&
    !url.startsWith("moz-extension:")
  );
}

function getImageSource(image) {
  return image.currentSrc || image.src || image.getAttribute("src") || "";
}

async function tryRenderImage(image, force) {
  if (!(image instanceof HTMLImageElement)) {
    return;
  }

  const sourceUrl = getImageSource(image);

  if (!isProcessableUrl(sourceUrl)) {
    return;
  }

  if (
    image.getAttribute(TIFF_VIEWER_PENDING_ATTRIBUTE) === "true" ||
    image.getAttribute(TIFF_VIEWER_PROCESSED_SOURCE_ATTRIBUTE) === sourceUrl
  ) {
    return;
  }

  image.setAttribute(TIFF_VIEWER_PENDING_ATTRIBUTE, "true");

  try {
    const response = await chrome.runtime.sendMessage({
      type: "render-tiff",
      url: sourceUrl,
      force
    });

    if (!response || response.ok !== true || !response.dataUrl) {
      return;
    }

    image.setAttribute(TIFF_VIEWER_PROCESSED_SOURCE_ATTRIBUTE, sourceUrl);
    image.srcset = "";
    image.removeAttribute("srcset");
    image.src = response.dataUrl;
  } catch (error) {
    console.debug("TIFF viewer: unable to replace image", error);
  } finally {
    image.removeAttribute(TIFF_VIEWER_PENDING_ATTRIBUTE);
  }
}

function inspectImage(image) {
  const sourceUrl = getImageSource(image);

  if (!isProcessableUrl(sourceUrl)) {
    return;
  }

  if (isLikelyTiffUrl(sourceUrl)) {
    tryRenderImage(image, true);
    return;
  }

  if (image.complete && image.naturalWidth === 0) {
    tryRenderImage(image, false);
  }
}

function inspectNode(node) {
  if (!(node instanceof Element)) {
    return;
  }

  if (node instanceof HTMLImageElement) {
    inspectImage(node);
  }

  if (typeof node.querySelectorAll === "function") {
    node.querySelectorAll("img").forEach(inspectImage);
  }
}

document.addEventListener(
  "error",
  (event) => {
    if (event.target instanceof HTMLImageElement) {
      tryRenderImage(event.target, false);
    }
  },
  true
);

new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach(inspectNode);
      return;
    }

    if (mutation.type === "attributes" && mutation.target instanceof HTMLImageElement) {
      inspectImage(mutation.target);
    }
  });
}).observe(document.documentElement || document, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ["src", "srcset"]
});

document.querySelectorAll("img").forEach(inspectImage);
