/**
 * @file Handles all network requests.
 * Its single responsibility is to fetch data from the server/JSON file.
 * This modularity means if we switch to a real API, we only change this file.
 */

export async function fetchRetailers() {
  try {
    const response = await fetch("retailers.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching retailers:", error);
    // Propagate the error to be handled by the main application logic.
    throw error;
  }
}
