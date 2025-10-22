      let retailers = [];
      let filteredRetailers = [];

      async function fetchRetailers() {
        try {
            const response = await fetch('retailers.json');
            retailers = await response.json();
            filteredRetailers = [...retailers];
            renderRetailers();
            updateStats();
        } catch (error) {
            console.error('Error fetching retailers:', error);
            const grid = document.getElementById("retailersGrid");
            grid.innerHTML = '<p class="error-message">Could not load retailer data. Please try again later.</p>';
        }
      }

      function renderRetailers(retailerList = filteredRetailers) {
        const grid = document.getElementById("retailersGrid");
        const noResults = document.getElementById("noResults");

        if (retailerList.length === 0) {
          grid.innerHTML = "";
          noResults.classList.remove("hidden");
          return;
        }

        noResults.classList.add("hidden");

        grid.innerHTML = retailerList
          .map(
            (retailer, index) => {
              const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(retailer.name + ',' + retailer.area)}&output=embed`;
              return `
                <div class="retailer-card">
                    <div class="retailer-number">Retailer ${index + 1}</div>
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
                      height="250"
                      style="border:0; margin-top: 1rem;"
                      loading="lazy"
                      allowfullscreen
                      data-src="${embedUrl}"
                      class="lazy-map">
                    </iframe>
                </div>
            `
            }
          )
          .join("");

        // Update visible retailers count
        document.getElementById("visibleRetailers").textContent =
          retailerList.length;
        
        lazyLoadMaps();
      }

      function lazyLoadMaps() {
        const lazyMaps = [].slice.call(document.querySelectorAll("iframe.lazy-map"));

        if ("IntersectionObserver" in window) {
          let lazyMapObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
              if (entry.isIntersecting) {
                let lazyMap = entry.target;
                lazyMap.src = lazyMap.dataset.src;
                lazyMap.classList.remove("lazy-map");
                lazyMapObserver.unobserve(lazyMap);
              }
            });
          });

          lazyMaps.forEach(function(lazyMap) {
            lazyMapObserver.observe(lazyMap);
          });
        } else {
          // Fallback for browsers that don't support IntersectionObserver
          lazyMaps.forEach(function(lazyMap) {
            lazyMap.src = lazyMap.dataset.src;
          });
        }
      }

      function searchRetailers(query) {
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm) {
          filteredRetailers = [...retailers];
        } else {
          filteredRetailers = retailers.filter(
            (retailer) =>
              retailer.name.toLowerCase().includes(searchTerm) ||
              retailer.area.toLowerCase().includes(searchTerm) ||
              (retailer.city && retailer.city.toLowerCase().includes(searchTerm))
          );
        }
        renderRetailers(filteredRetailers);
      }

      function updateStats() {
        const uniqueAreas = [...new Set(retailers.map((r) => r.area))];
        document.getElementById("totalAreas").textContent = uniqueAreas.length;
        document.getElementById("totalRetailers").textContent =
          retailers.length;
      }

      // Event listeners
      document.getElementById("searchInput").addEventListener("input", (e) => {
        searchRetailers(e.target.value);
      });

      // Initialize the page
      document.addEventListener("DOMContentLoaded", () => {
        fetchRetailers();
      });

      // Add smooth scroll behavior
      document.documentElement.style.scrollBehavior = "smooth";
