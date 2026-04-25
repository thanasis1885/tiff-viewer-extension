let initializedMemoryLimitInBytes = null;
let debugLoggingEnabled = false;
const DEFAULT_OPTIONS = {
  DecoderMemoryLimitInMegabytes: 32,
  ShowDebugOutput: false
};

function logDebug(...args) {
  if (debugLoggingEnabled) {
    console.log("TIFF viewer:", ...args);
  }
}

async function ensureInitialized(options) {
  const memoryLimitInBytes = options.DecoderMemoryLimitInMegabytes * 1e6;

  debugLoggingEnabled = options.ShowDebugOutput === true;

  if (initializedMemoryLimitInBytes === memoryLimitInBytes) {
    return;
  }

  Tiff.initialize({ TOTAL_MEMORY: memoryLimitInBytes });
  initializedMemoryLimitInBytes = memoryLimitInBytes;

  logDebug("Initialized TIFF decoder with memory limit", memoryLimitInBytes);
}

async function renderTiffFromUrl(url, options) {
  const normalizedOptions = {
    DecoderMemoryLimitInMegabytes:
      options.DecoderMemoryLimitInMegabytes ??
      DEFAULT_OPTIONS.DecoderMemoryLimitInMegabytes,
    ShowDebugOutput:
      options.ShowDebugOutput ?? DEFAULT_OPTIONS.ShowDebugOutput
  };

  await ensureInitialized(normalizedOptions);

  logDebug("Fetching", url);

  const response = await fetch(url, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") || "";
  const buffer = await response.arrayBuffer();

  let tiff;

  try {
    tiff = new Tiff({ buffer });

    return {
      ok: true,
      contentType,
      dataUrl: tiff.toDataURL()
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "libtiff failed to decode the image."
    );
  } finally {
    if (tiff && typeof tiff.close === "function") {
      tiff.close();
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== "offscreen-render-tiff") {
    return;
  }

  renderTiffFromUrl(message.url, message.options || {})
    .then((response) => {
      sendResponse(response);
    })
    .catch((error) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
    });

  return true;
});
