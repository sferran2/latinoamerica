// Import helper function to fetch country images from Unsplash
import { getCountryImage } from "./Unsplash.mjs";
// Import Leaflet and its styles for the interactive map
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Wait for DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  // Handle the search form submission
  const form = document.querySelector("#country-form");
  const input = document.querySelector("#country-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    const countryParam = encodeURIComponent(query);
    window.location.href = `country.html?country=${countryParam}`;
  });

  // Disable map interactivity (static display only)
  const map = L.map("map", {
    zoomSnap: 0.1,
    zoomDelta: 0.1,
  }).setView([-20, -65], 3.2);

  // Disable map interactivity (static display only)
  map.scrollWheelZoom.disable();
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  map.zoomControl.remove();

  // Load a light basemap layer from Carto
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    },
  ).addTo(map);

  const response = await fetch("/data/countries.geo.json");
  const geoData = await response.json();

  const latinCountries = [
    "Argentina",
    "Bolivia",
    "Brazil",
    "Chile",
    "Colombia",
    "Ecuador",
    "Panama",
    "Paraguay",
    "Peru",
    "Uruguay",
    "Venezuela",
  ];

  const filtered = {
    ...geoData,
    features: geoData.features.filter((f) =>
      latinCountries.includes(f.properties.name),
    ),
  };

  L.geoJSON(filtered, {
    style: {
      color: "#31572c",
      weight: 3,
      fillColor: "#85BA3C",
      fillOpacity: 0.3,
    },
    onEachFeature: (feature, layer) => {
      const countryName = feature.properties.name;

      layer.on("click", () => {
        const countryParam = encodeURIComponent(countryName);
        window.location.href = `country.html?country=${countryParam}`;
      });

      const center = layer.getBounds().getCenter();

      const labelOffsets = {
        Chile: [-20, -90],
        Argentina: [-40, -10],
        Uruguay: [-10, 12],
        Brazil: [0, -15],
        Colombia: [-30, 5],
        Ecuador: [-45, 0],
        Peru: [-35, -18],
        Bolivia: [-30, 10],
        Paraguay: [-15, -5],
        Venezuela: [-30, -15],
        Panama: [-30, -20],
      };

      const offset = labelOffsets[countryName] || [0, 0];
      const adjustedLat = center.lat + offset[1] * 0.01;
      const adjustedLng = center.lng + offset[0] * 0.01;

      L.tooltip({
        permanent: true,
        direction: "right",
        className: "country-label",
        offset,
      })
        .setContent(countryName)
        .setLatLng([adjustedLat, adjustedLng])
        .addTo(map);
    },
  }).addTo(map);

  // Prepare containers to hold the rotating country images
  const imgContainers = [
    document.getElementById("country-img-1"),
    document.getElementById("country-img-2"),
    document.getElementById("country-img-3"),
  ];

  // Function to rotate featured country images every 50 seconds
  async function rotateCountryImages() {
    const countries = [
      "Brazil",
      "Peru",
      "Chile",
      "Colombia",
      "Panama",
      "Venezuela",
      "Ecuador",
      "Bolivia",
      "Paraguay",
      "Uruguay",
      "Argentina",
    ];

    const imageCache = {};

    await Promise.all(
      countries.map(async (country) => {
        if (!imageCache[country]) {
          try {
            const imageData = await getCountryImage(country);
            imageCache[country] = imageData || {
              url: "/images/fallback.jpg",
              alt: country,
            };
          } catch (error) {
            console.warn(`Image fetch failed for ${country}`, error);
            imageCache[country] = {
              url: "/images/fallback.jpg",
              alt: country,
            };
          }
        }
      }),
    );

    let index = 0;

    // Updates the image containers with the next 3 countries
    function updateImages() {
      const currentCountries = countries.slice(index, index + 3);

      currentCountries.forEach((country, i) => {
        const imgObj = imageCache[country];
        if (imgObj && imgContainers[i]) {
          const container = imgContainers[i];
          container.classList.remove("show");

          setTimeout(() => {
            container.style.backgroundImage = `url('${imgObj.url}')`;
            container.setAttribute("aria-label", imgObj.alt || country);


            // Add or update caption overlay
            let caption = container.querySelector(".caption");
            if (!caption) {
              caption = document.createElement("div");
              caption.className = "caption";
              container.appendChild(caption);
            }
            caption.textContent = country;

            container.classList.add("show");
          }, 200);
        }
      });

      index = (index + 3) % countries.length;
    }

    updateImages(); // show immediately
    setInterval(updateImages, 50000); // rotate every 50 seconds
  }

  // Start the rotating image feature
  rotateCountryImages();
});
