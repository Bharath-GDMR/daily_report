/**
 * @file This script runs in a separate background thread (Web Worker).
 * Its ONLY job is to receive a list of items and build an HTML string.
 * It CANNOT access the DOM. This ensures the main UI thread remains
 * fast and responsive.
 */

self.onmessage = function (event) {
  const { page, items, startIndex } = event.data;

  if (!items || items.length === 0) {
    self.postMessage({ page, htmlString: "" });
    return;
  }

  const htmlString = items
    .map((retailer, index) =>
      createRetailerCardHTML(retailer, startIndex + index)
    )
    .join("");

  self.postMessage({ page, htmlString });
};

function getMapEmbedUrl(retailer) {
  const { name, area, city } = retailer;
  const query = `${name}, ${area}, ${city}`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    query
  )}&output=embed`;
}

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
