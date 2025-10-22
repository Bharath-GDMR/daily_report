import { getFilteredRetailers, getCurrentPage } from "./state.js";
import { ITEMS_PER_PAGE } from "./config.js";

/**
 * @file Manages the Web Worker.
 * Its responsibilities are:
 * - Creating the worker.
 * - Sending data to the worker for processing.
 * - Receiving the processed HTML from the worker.
 * - Caching the pre-rendered HTML.
 */

let rendererWorker;
let preRenderedPages = {}; // Cache for HTML strings from the worker.

// Initialize the worker if the browser supports it.
if (window.Worker) {
  rendererWorker = new Worker(`./js/renderer.worker.js?v=${new Date().getTime()}`, {
    type: "module",
  });
  rendererWorker.onmessage = handleWorkerMessage;
} else {
  console.warn(
    "Web Workers are not supported in this browser. Background rendering will be disabled."
  );
}

/**
 * Handles messages received from the Web Worker.
 * @param {MessageEvent} event - The message event from the worker.
 */
function handleWorkerMessage(event) {
  const { page, htmlString } = event.data;
  console.log(
    `✅ Main Thread: Received pre-rendered HTML for page ${page} from worker.`
  );
  preRenderedPages[page] = htmlString;

  // Proactively prepare the *next* page after one is finished.
  scheduleNextPageLoad();
}

/**
 * Schedules the next page of items to be rendered in the background.
 * Uses `requestIdleCallback` to ensure this work doesn't block the UI.
 */
export function scheduleNextPageLoad() {
  if (!rendererWorker) return;

  // Use requestIdleCallback to run this task when the browser is not busy.
  if ("requestIdleCallback" in window) {
    requestIdleCallback(prepareNextPage, { timeout: 2000 });
  } else {
    // Fallback for browsers that don't support it.
    setTimeout(prepareNextPage, 500);
  }
}

/**
 * Gathers data for the next page and sends it to the worker.
 */
function prepareNextPage() {
  const filtered = getFilteredRetailers();
  const currentPage = getCurrentPage();
  const nextPage = currentPage + 1;

  // Don't do anything if the next page is already cached or being processed,
  // or if there are no more items.
  const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
  if (preRenderedPages[nextPage] || startIndex >= filtered.length) {
    return;
  }

  console.log(
    `💡 Main Thread: Idle time detected. Asking worker to prepare page ${nextPage}.`
  );

  const endIndex = nextPage * ITEMS_PER_PAGE;
  const items = filtered.slice(startIndex, endIndex);

  rendererWorker.postMessage({
    page: nextPage,
    items: items,
    startIndex: startIndex,
  });
}

/**
 * Retrieves a pre-rendered page from the cache and removes it.
 * @param {number} page - The page number to retrieve.
 * @returns {string|null} The HTML string or null if not found.
 */
export function getPreRenderedPage(page) {
  if (preRenderedPages[page]) {
    const html = preRenderedPages[page];
    delete preRenderedPages[page]; // Use it once and remove
    return html;
  }
  return null;
}
