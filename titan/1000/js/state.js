/**
 * @file Manages the application's state.
 * This is the single source of truth for all dynamic data,
 * such as the list of retailers, search results, and pagination.
 * This adheres to SRP by centralizing state logic.
 */

let state = {
  allRetailers: [],
  filteredRetailers: [],
  currentPage: 1,
  searchQuery: "",
};

// --- GETTERS ---
// Functions to get pieces of the state.
export const getAllRetailers = () => state.allRetailers;
export const getFilteredRetailers = () => state.filteredRetailers;
export const getCurrentPage = () => state.currentPage;

// --- SETTERS ---
// Functions to update the state.
export function setAllRetailers(retailers) {
  state.allRetailers = retailers;
  state.filteredRetailers = retailers; // Initially, all retailers are shown.
}

export function setFilteredRetailers(retailers) {
  state.filteredRetailers = retailers;
}

export function setCurrentPage(page) {
  state.currentPage = page;
}

export function incrementCurrentPage() {
  state.currentPage++;
}
