import { getFilteredRetailers, getAllRetailers } from "./state.js";
import { ITEMS_PER_PAGE } from "./config.js";

/**
 * @file Handles all direct DOM manipulation.
 * Its responsibilities include rendering retailer cards, updating stats,
 * and showing/hiding UI elements like loaders or "no results" messages.
 * It reads from the state but does not modify it.
 */

const grid = document.getElementById("retailersGrid");
const noResults = document.getElementById("noResults");
const totalRetailersEl = document.getElementById("totalRetailers");
const totalAreasEl = document.getElementById("totalAreas");
const visibleRetailersEl = document.getElementById("visibleRetailers");
const sentinel = document.getElementById("sentinel");
const loader = sentinel.querySelector(".loading");

import { lazyLoadMaps } from "./map-loader.js";

/**
 * Renders a list of retailer items to the grid.
 * @param {Array<Object>} retailerList - The list of retailers to render.
 * @param {boolean} replace - If true, clears the grid before rendering.
 */
export function renderRetailers(retailerList, options = {}) {
  const { replace = false, startIndex = 0 } = options;
  toggleNoResults(retailerList.length === 0 && replace);

  const html = retailerList
    .map((retailer, index) => createRetailerCardHTML(retailer, startIndex + index))
    .join("");

  if (replace) {
    grid.innerHTML = html;
  } else {
    grid.insertAdjacentHTML("beforeend", html);
  }
  updateVisibleCount();
  lazyLoadMaps(grid); // Trigger map loading for the new items
}

/**
 * Appends a pre-rendered HTML string to the grid.
 * @param {string} htmlString - The HTML string to append.
 */
export function appendPreRenderedHtml(htmlString) {
  const fragment = document.createRange().createContextualFragment(htmlString);
  grid.appendChild(fragment);
  updateVisibleCount();
  lazyLoadMaps(grid);
}

/**
 * Performs the initial render on page load.
 */
export function renderInitialLoad() {
  const initialItems = getFilteredRetailers().slice(0, ITEMS_PER_PAGE);
  renderRetailers(initialItems, { replace: true, startIndex: 0 });
}

/**
 * Creates the URL for the Google Maps embed.
 * @param {Object} retailer
 * @returns {string}
 */
function getMapEmbedUrl(retailer) {
  const { name, area, city } = retailer;
  const query = `${name}, ${area}, ${city}`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    query
  )}&output=embed`;
}

/**
 * Creates the HTML string for a single retailer card.
 * NOTE: This function is duplicated in renderer.worker.js. If you change it
 * here, you MUST change it there as well.
 * @param {Object} retailer - The retailer object.
 * @param {number} overallIndex - The overall index of the retailer in the full list.
 * @returns {string} The HTML string for the card.
 */
function createRetailerCardHTML(retailer, overallIndex) {
  const id =
    retailer.sapCode || (retailer.name + retailer.contact).replace(/\s/g, "");
  const embedUrl = getMapEmbedUrl(retailer);

  return `
      <div class="retailer-card" id="retailer-${id}">
          <div class="retailer-number">Retailer ${overallIndex + 1}</div>
          <div class="retailer-info">
              <div class="retailer-name">${retailer.name}</div>
              <div class="retailer-area">
                  <span class="location-icon">📍</span>
                  ${retailer.area}
              </div>
              <div class="retailer-area">
                  <span class="location-icon">📞</span>
                  ${retailer.contact}
              </div>
          </div>
          <iframe
              width="100%"
              height="200"
              style="border:0; border-radius: 8px; margin-top: 1rem;"
              loading="lazy"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              data-src="${embedUrl}"
              data-name="${retailer.name}"
              class="lazy-map">
          </iframe>
      </div>
  `;
}

/**
 * Updates the statistics display.
 */
export function updateStats() {
  const allRetailers = getAllRetailers();
  const uniqueAreas = [...new Set(allRetailers.map((r) => r.area))];
  totalRetailersEl.textContent = allRetailers.length;
  totalAreasEl.textContent = uniqueAreas.length;
  updateVisibleCount();
}

/**
 * Updates just the "Currently Showing" stat.
 */
function updateVisibleCount() {
  visibleRetailersEl.textContent = grid.children.length;
}

/**
 * Shows or hides the "No Results" message.
 * @param {boolean} show - True to show, false to hide.
 */
export function toggleNoResults(show) {
  noResults.classList.toggle("hidden", !show);
}

/**
 * Shows or hides the loading spinner at the bottom.
 * @param {boolean} show - True to show, false to hide.
 */
export function toggleLoader(show) {
  loader.classList.toggle("hidden", !show);
}
