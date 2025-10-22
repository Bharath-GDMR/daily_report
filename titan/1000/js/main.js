import { fetchRetailers } from "./api.js";
import { initializeEventListeners } from "./events.js";
import { updateStats, renderInitialLoad } from "./ui.js";
import { setAllRetailers } from "./state.js";
import { scheduleNextPageLoad } from "./worker-manager.js";

/**
 * @file Main application entry point.
 * Orchestrates the initialization of the application.
 * Follows the Single Responsibility Principle by delegating tasks
 * to specialized modules.
 */

// This is the main function that kicks everything off.
async function main() {
  try {
    // 1. Fetch all retailer data from the JSON file.
    const allData = await fetchRetailers();

    // 2. Set the data in our central state management.
    setAllRetailers(allData);

    // 3. Perform the initial render of the first page of items.
    renderInitialLoad();

    // 4. Calculate and display the statistics.
    updateStats();

    // 5. Set up all user interaction listeners (search, scroll).
    initializeEventListeners();

    // 6. Proactively start preparing the next page in the background
    //    during browser idle time.
    scheduleNextPageLoad();
  } catch (error) {
    console.error("Failed to initialize the application:", error);
    // You could render an error message to the user here.
  }
}

// Start the application once the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", main);
