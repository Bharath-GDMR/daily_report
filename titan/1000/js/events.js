import {
  getFilteredRetailers,
  setCurrentPage,
  incrementCurrentPage,
} from "./state.js";
import { renderRetailers, toggleLoader, appendPreRenderedHtml } from "./ui.js";
import { handleSearch } from "./search.js";
import { getPreRenderedPage, scheduleNextPageLoad } from "./worker-manager.js";
import { ITEMS_PER_PAGE } from "./config.js";

/**
 * @file Manages all event listeners for the application.
 * This includes search input and the Intersection Observer for infinite scrolling.
 * It acts as the bridge between user actions and application logic.
 */

let intersectionObserver;

export function initializeEventListeners() {
  const searchInput = document.getElementById("searchInput");
  // Use 'input' for real-time searching as the user types.
  searchInput.addEventListener("input", (e) => handleSearch(e.target.value));

  setupScrollObserver();
}

/**
 * Sets up the Intersection Observer to detect when the user scrolls
 * to the bottom of the list.
 */
function setupScrollObserver() {
  const sentinel = document.getElementById("sentinel");
  const options = {
    rootMargin: "0px",
    threshold: 0.1, // Trigger when 10% of the sentinel is visible
  };

  intersectionObserver = new IntersectionObserver(handleIntersect, options);
  intersectionObserver.observe(sentinel);
}

/**
 * The callback function for the Intersection Observer.
 * This is where the magic of infinite scrolling happens.
 * @param {Array<IntersectionObserverEntry>} entries
 */
function handleIntersect(entries) {
  const entry = entries[0];
  if (entry.isIntersecting) {
    loadMoreItems();
  }
}

/**
 * Loads the next page of items. It first checks for pre-rendered content,
 * then falls back to on-the-fly rendering if necessary.
 */
function loadMoreItems() {
  const filtered = getFilteredRetailers();
  const currentVisibleCount =
    document.getElementById("retailersGrid").children.length;

  // Stop if all items are already displayed
  if (currentVisibleCount >= filtered.length) {
    toggleLoader(false);
    return;
  }

  toggleLoader(true);

  // A small delay to simulate network latency and show the loader
  setTimeout(() => {
    const nextPage = Math.ceil(currentVisibleCount / ITEMS_PER_PAGE) + 1;

    // 1. Check if the next page is already rendered by our worker
    const preRenderedHtml = getPreRenderedPage(nextPage);

    if (preRenderedHtml) {
      console.log(
        `🚀 Instant load! Appending pre-rendered HTML for page ${nextPage}.`
      );
      appendPreRenderedHtml(preRenderedHtml);
      incrementCurrentPage();

      // Proactively load the *next* next page.
      scheduleNextPageLoad();
    } else {
      // 2. Fallback: Render on the main thread if user scrolls too fast
      console.log(
        `🏃 User scrolled too fast! Rendering page ${nextPage} on main thread.`
      );
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = nextPage * ITEMS_PER_PAGE;
      const newItems = filtered.slice(startIndex, endIndex);
      renderRetailers(newItems, { replace: false, startIndex: startIndex });
      setCurrentPage(nextPage);
    }

    toggleLoader(false);
  }, 300); // Artificial delay
}
