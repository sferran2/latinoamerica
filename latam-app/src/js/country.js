import { searchCountryByName } from "./RestCountries.mjs";
import { getCountryImage } from "./Unsplash.mjs";

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const countryName = params.get("country");

    if (!countryName) return;

    try {
        const country = await searchCountryByName(countryName);
        displayCountryInfo(country);
        showCountryOnMap(country);
    } catch (err) {
        console.error("Country not found", err);
    }
});

async function displayCountryInfo(country) {
    document.getElementById("country-name").textContent = country.name?.common || "Unknown";

    document.getElementById("quick-facts").innerHTML = `
        <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
        <p><strong>Population:</strong> ${country.population?.toLocaleString() || "N/A"}</p>
        <p><strong>Currency:</strong> ${country.currencies
            ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(", ")
            : "N/A"
        }</p>
        <p><strong>Languages:</strong> ${country.languages
            ? Object.values(country.languages).join(", ")
            : "N/A"
        }</p>
    `;

    try {
        const imageUrl = await getCountryImage(country.name.common);
        const img = document.getElementById("country-image");
        img.src = imageUrl;
        img.alt = `Landscape of ${country.name.common}`;
    } catch (e) {
        console.warn("No image found");
        document.getElementById("country-image").style.display = "none";
    }
}

function showCountryOnMap(country) {
    const latlng = country.latlng;
    if (!latlng || latlng.length < 2) return;

    const map = L.map("country-map").setView(latlng, 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    L.marker(latlng)
        .addTo(map)
        .bindPopup(`<b>${country.name.common}</b><br>Capital: ${country.capital?.[0] || "N/A"}`)
        .openPopup();
}
