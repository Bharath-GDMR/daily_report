/**
 * @file Manages the lazy loading of map iframes.
 * Adheres to SRP by isolating all map-loading logic.
 */

let mapObserver;

/**
 * Initializes the Intersection Observer for maps.
 */
function getObserver() {
  if (mapObserver) {
    return mapObserver;
  }

  const options = {
    rootMargin: '0px',
    threshold: 0.1, // Start loading when 10% is visible
  };

  mapObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyMap = entry.target;
        // console.log(`🗺️ Loading map for: ${lazyMap.dataset.name}`);
        lazyMap.src = lazyMap.dataset.src;
        lazyMap.classList.remove("lazy-map");
        mapObserver.unobserve(lazyMap);
      }
    });
  }, options);

  return mapObserver;
}

/**
 * Finds all lazy-loadable maps within a given container and observes them.
 * @param {HTMLElement} container - The parent element of the maps to load.
 */
export function lazyLoadMaps(container) {
  const observer = getObserver();
  const lazyMaps = container.querySelectorAll("iframe.lazy-map");
  lazyMaps.forEach((lazyMap) => {
    observer.observe(lazyMap);
  });
}
