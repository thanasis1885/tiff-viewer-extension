const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";
const NAVIGATION_REDIRECT_RULE_ID = 1001;
const TIFF_RESPONSE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_OPTIONS = {
  DecoderMemoryLimitInMegabytes: 32,
  ShowDebugOutput: false
};

const observedTiffResponses = new Map();
const inFlightRenderJobs = new Map();
let offscreenDocumentPromise = null;

function isLikelyTiffUrl(url) {
  return /^(?:https?|file):\/\/.+\.tiff?(?:[?#].*)?$/i.test(url);
}

function getViewerUrlForSource(sourceUrl) {
  return `${chrome.runtime.getURL("viewer/viewer.html")}#${sourceUrl}`;
}

function getObservedResponseKey(tabId, frameId, url) {
  return `${tabId}:${frameId}:${url}`;
}

function pruneObservedResponses() {
  const now = Date.now();

  for (const [key, expiresAt] of observedTiffResponses.entries()) {
    if (expiresAt <= now) {
      observedTiffResponses.delete(key);
    }
  }
}

function rememberObservedTiffResponse(details) {
  if (details.tabId < 0) {
    return;
  }

  pruneObservedResponses();
  observedTiffResponses.set(
    getObservedResponseKey(details.tabId, details.frameId, details.url),
    Date.now() + TIFF_RESPONSE_TTL_MS
  );
}

function hasObservedTiffResponse(tabId, frameId, url) {
  pruneObservedResponses();

  const expiresAt = observedTiffResponses.get(
    getObservedResponseKey(tabId, frameId, url)
  );

  return typeof expiresAt === "number" && expiresAt > Date.now();
}

function contentTypeHeaderIsTiff(headers) {
  if (!Array.isArray(headers)) {
    return false;
  }

  return headers.some((header) => {
    if (!header || !header.name || !header.value) {
      return false;
    }

    return (
      header.name.toLowerCase() === "content-type" &&
      header.value.toLowerCase().includes("image/tiff")
    );
  });
}

function ignorePromiseRejection(promise) {
  promise.catch((error) => {
    console.warn("TIFF viewer:", error);
  });
}

function rememberTiffResponses(details) {
  if (!contentTypeHeaderIsTiff(details.responseHeaders)) {
    return;
  }

  rememberObservedTiffResponse(details);

  if (
    details.type === "main_frame" &&
    details.tabId >= 0 &&
    !details.url.startsWith(chrome.runtime.getURL("")) &&
    !isLikelyTiffUrl(details.url)
  ) {
    ignorePromiseRejection(
      chrome.tabs.update(details.tabId, { url: getViewerUrlForSource(details.url) })
    );
  }
}

async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);

  if (typeof chrome.runtime.getContexts === "function") {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [offscreenUrl]
    });

    if (contexts.length > 0) {
      return;
    }
  }

  if (!offscreenDocumentPromise) {
    offscreenDocumentPromise = chrome.offscreen
      .createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: ["BLOBS"],
        justification: "Render TIFF files into displayable image data."
      })
      .finally(() => {
        offscreenDocumentPromise = null;
      });
  }

  await offscreenDocumentPromise;
}

async function closeOffscreenDocumentIfPresent() {
  if (typeof chrome.runtime.getContexts === "function") {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
    });

    if (!contexts.length) {
      return;
    }
  }

  await chrome.offscreen.closeDocument();
}

async function renderTiffUrl(url) {
  const existingJob = inFlightRenderJobs.get(url);
  if (existingJob) {
    return existingJob;
  }

  const renderJob = (async () => {
    await ensureOffscreenDocument();
    const storedOptions = await chrome.storage.local.get([
      "DecoderMemoryLimitInMegabytes",
      "ShowDebugOutput"
    ]);
    const options = {
      DecoderMemoryLimitInMegabytes:
        storedOptions.DecoderMemoryLimitInMegabytes ??
        DEFAULT_OPTIONS.DecoderMemoryLimitInMegabytes,
      ShowDebugOutput:
        storedOptions.ShowDebugOutput ?? DEFAULT_OPTIONS.ShowDebugOutput
    };

    const response = await chrome.runtime.sendMessage({
      type: "offscreen-render-tiff",
      url,
      options
    });

    if (!response || response.ok !== true || !response.dataUrl) {
      throw new Error(
        response && response.error ? response.error : "Unable to render TIFF image."
      );
    }

    return response;
  })();

  inFlightRenderJobs.set(url, renderJob);

  try {
    return await renderJob;
  } finally {
    inFlightRenderJobs.delete(url);
  }
}

async function installNavigationRedirectRule() {
  const viewerUrl = chrome.runtime.getURL("viewer/viewer.html");

  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [NAVIGATION_REDIRECT_RULE_ID],
    addRules: [
      {
        id: NAVIGATION_REDIRECT_RULE_ID,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            regexSubstitution: `${viewerUrl}#\\0`
          }
        },
        condition: {
          regexFilter: "^(?:https?|file):\\/\\/.+\\.tiff?(?:[?#].*)?$",
          isUrlFilterCaseSensitive: false,
          resourceTypes: ["main_frame", "sub_frame"]
        }
      }
    ]
  });
}

chrome.runtime.onInstalled.addListener(() => {
  ignorePromiseRejection(installNavigationRedirectRule());
});

chrome.runtime.onStartup.addListener(() => {
  ignorePromiseRejection(installNavigationRedirectRule());
});

ignorePromiseRejection(installNavigationRedirectRule());

chrome.webRequest.onHeadersReceived.addListener(
  rememberTiffResponses,
  {
    urls: ["<all_urls>"],
    types: ["main_frame", "sub_frame", "image"]
  },
  ["responseHeaders"]
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "render-tiff") {
    (async () => {
      const url = typeof message.url === "string" ? message.url : "";
      const tabId = sender.tab ? sender.tab.id : -1;
      const frameId = typeof sender.frameId === "number" ? sender.frameId : -1;
      const shouldRender =
        message.force === true || hasObservedTiffResponse(tabId, frameId, url);

      if (!url || !shouldRender) {
        sendResponse({ ok: false, error: "Not a known TIFF resource." });
        return;
      }

      try {
        const response = await renderTiffUrl(url);
        sendResponse(response);
      } catch (error) {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    })();

    return true;
  }

  if (message && message.type === "tiff-options-updated") {
    ignorePromiseRejection(closeOffscreenDocumentIfPresent());
    sendResponse({ ok: true });
  }
});
