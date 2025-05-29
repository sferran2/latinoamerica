import { searchCountryByName } from "./RestCountries.mjs";
import { getCountryImage } from "./Unsplash.mjs";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#country-form");
    const input = document.querySelector("#country-input");
    const info = document.querySelector("#country-info");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;

        const countryParam = encodeURIComponent(query);
        window.location.href = `country.html?country=${countryParam}`;
    });

    async function displayCountryInfo(country) {
        const name = country.name?.common || "N/A";
        const capital = country.capital?.[0] || "N/A";
        const population = country.population?.toLocaleString() || "N/A";

        const currencies = country.currencies
            ? Object.values(country.currencies)
                .map((c) => `${c.name} (${c.symbol})`)
                .join(", ")
            : "N/A";

        const languages = country.languages
            ? Object.values(country.languages).join(", ")
            : "N/A";

        let imageHtml = "";
        try {
            const imageUrl = await getCountryImage(name);
            if (imageUrl) {
                imageHtml = `<img src="${imageUrl}" alt="${name} landscape" class="country-photo"/>`;
            }
        } catch (error) {
            console.warn("Image not found for", name);
        }

        info.innerHTML = `
      ${imageHtml}
      <h2>${name}</h2>
      <p><strong>Capital:</strong> ${capital}</p>
      <p><strong>Population:</strong> ${population}</p>
      <p><strong>Currency:</strong> ${currencies}</p>
      <p><strong>Languages:</strong> ${languages}</p>
    `;
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const map = L.map("map", {
        zoomSnap: 0.1,
        zoomDelta: 0.1
    }).setView([-25, -65], 3.2);

    map.scrollWheelZoom.disable();
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    map.zoomControl.remove();

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    const response = await fetch("/data/countries.geo.json");
    const geoData = await response.json();

    const latinCountries = [
        "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador",
        "Panama", "Paraguay", "Peru", "Uruguay", "Venezuela"
    ];

    const filtered = {
        ...geoData,
        features: geoData.features.filter(f =>
            latinCountries.includes(f.properties.name)
        )
    };

    L.geoJSON(filtered, {
        style: {
            color: "#0a9396",
            weight: 3,
            fillColor: "#94d28d",
            fillOpacity: 0.2,
        },
        onEachFeature: (feature, layer) => {
            const countryName = feature.properties.name;

            layer.on("click", () => {
                const countryParam = encodeURIComponent(countryName);
                window.location.href = `country.html?country=${countryParam}`;
            });

            const center = layer.getBounds().getCenter();

            const labelOffsets = {
                Chile: [-40, -90],
                Argentina: [1, 20],
                Uruguay: [10, 20],
                Brazil: [0, -15],
                Colombia: [-30, 5],
                Ecuador: [-75, 0],
                Peru: [-35, -18],
                Bolivia: [-30, 10],
                Paraguay: [-8, -15],
                Venezuela: [-30, -15],
                Panama: [-30, -20]
            };

            const offset = labelOffsets[countryName] || [0, 0];
            const adjustedLat = center.lat + offset[1] * 0.01;
            const adjustedLng = center.lng + offset[0] * 0.01;

            L.tooltip({
                permanent: true,
                direction: "right",
                className: "country-label",
                offset
            })
                .setContent(countryName)
                .setLatLng([adjustedLat, adjustedLng])
                .addTo(map);
        }
    }).addTo(map);
});


