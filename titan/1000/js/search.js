import {
  setFilteredRetailers,
  setCurrentPage,
  getAllRetailers,
} from "./state.js";
import { renderRetailers } from "./ui.js";
import { ITEMS_PER_PAGE } from "./config.js";
import { scheduleNextPageLoad } from "./worker-manager.js";

/**
 * @file Contains the logic for searching and filtering retailers.
 * This keeps search-related functionality isolated.
 */

// A simple debounce utility to prevent firing the search on every keystroke.
let debounceTimer;
function debounce(func, delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
}

export function handleSearch(query) {
  debounce(() => {
    const searchTerm = query.toLowerCase().trim();
    const allRetailers = getAllRetailers();
    let results;

    if (!searchTerm) {
      results = allRetailers;
    } else {
      results = allRetailers.filter(
        (retailer) =>
          retailer.name.toLowerCase().includes(searchTerm) ||
          retailer.area.toLowerCase().includes(searchTerm) ||
          (retailer.city && retailer.city.toLowerCase().includes(searchTerm))
      );
    }

    // Update the application state with the filtered results
    setFilteredRetailers(results);

    // Reset to page 1 for the new search results
    setCurrentPage(1);

    // Render only the first page of the new results
    const firstPageOfResults = results.slice(0, ITEMS_PER_PAGE);
    renderRetailers(firstPageOfResults, { replace: true, startIndex: 0 });

    // After a search, schedule a background load for the new result set.
    scheduleNextPageLoad();
  }, 300); // 300ms delay
}
