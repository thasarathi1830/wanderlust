// Ensure listing data exists
if (!listing || !listing.geometry || !listing.geometry.coordinates) {
  console.error("Listing geometry not found");
} else {
  const [lng, lat] = listing.geometry.coordinates;

  // Initialize Leaflet map
  const map = L.map("map").setView([lat, lng], 9);

  // OpenStreetMap tiles (FREE, no API key)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Marker
  const marker = L.marker([lat, lng]).addTo(map);

  // Popup
  marker.bindPopup(`
    <div class="map-click">
      <h4><b>${listing.title}</b></h4>
      <p>Exact location will be provided after booking.</p>
    </div>
  `);

  // Optional: open popup by default
  marker.openPopup();
}
