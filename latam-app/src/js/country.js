// Import function to retrieve country data from the REST Countries API
import { searchCountryByName } from "./RestCountries.mjs";

// Wait for the page to fully load before running any logic
let loadedCountry = null;

document.addEventListener("DOMContentLoaded", () => {
  initCountryPage();
});

// Main function to initialize the country page content
async function initCountryPage() {
  const params = new URLSearchParams(window.location.search);
  const countryName = params.get("country");
  if (!countryName) return;

  try {
    const country = await searchCountryByName(countryName);
    loadedCountry = country;
    const capital = country.capital?.[0] || "Bogotá";
    displayCountryInfo(country);
    await setHeroImages(country.name.common);
    await loadTravelTips(country.name.common);
    await loadCountryNews(country.name.common);
    await loadWeatherForecast(capital);
  } catch (err) {
    console.error("❌ Country not found:", err);
  }
}

// Displays country facts
function displayCountryInfo(country) {
  const name = country.name?.common || "Unknown";
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

  const countryTitle = document.getElementById("country-title");
  if (countryTitle) {
    countryTitle.textContent = name;
  }

  // Insert quick facts into sticky note section
  const quickFactsContainer = document.getElementById("quick-facts-content");
  if (quickFactsContainer) {
    quickFactsContainer.innerHTML = `
            <p><strong data-translate="capital_label">Capital:</strong> ${capital}</p>
            <p><strong data-translate="population_label">Population:</strong> ${population}</p>
            <p><strong data-translate="currency_label">Currency:</strong> ${currencies}</p>
            <p><strong data-translate="languages_label">Languages:</strong> ${languages}</p>
        `;
  }
}

// Event: Add country to wishlist and redirect to wishlist page
document.getElementById("add-to-wishlist").addEventListener("click", () => {
  const params = new URLSearchParams(window.location.search);
  let countryName = params.get("country");
  if (!countryName) return;

  // Capitalize only the first letter
  countryName = countryName.charAt(0).toUpperCase() + countryName.slice(1);

  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  if (!wishlist.includes(countryName)) {
    wishlist.push(countryName);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }

  window.location.href = "wishlist.html";
});

// Rotates hero background images every 50 seconds using Unsplash API
async function setHeroImages(countryName) {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(countryName)}&orientation=landscape&client_id=He3g0nco3fHhMqKolj6dNCcjfdorOXCNmW1x0ueUBag&per_page=9`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Unsplash error: ${res.status}`);
    const data = await res.json();

    const containers = [
      document.getElementById("hero-img-1"),
      document.getElementById("hero-img-2"),
      document.getElementById("hero-img-3"),
    ];

    if (data.results.length < 3) return;

    let startIndex = 0;

    function rotateImages() {
      containers.forEach((el, i) => {
        const img = data.results[(startIndex + i) % data.results.length];
        el.style.backgroundImage = `url('${img.urls.regular}')`;
      });
      startIndex = (startIndex + 3) % data.results.length;
    }

    rotateImages();
    setInterval(rotateImages, 50000);
  } catch (e) {
    console.warn("⚠️ Failed to set hero images:", e);
  }
}

// Loads travel tips from local JSON file and renders Top 5 cities 
async function loadTravelTips(countryName) {
  const currentLang = localStorage.getItem("lang") || "en";
  try {
    const fileToLoad =
      currentLang === "es"
        ? "../data/tipsViaje.json"
        : "../data/travelTips.json";
    const response = await fetch(fileToLoad);
    if (!response.ok)
      throw new Error(`Tips JSON load error: ${response.status}`);
    const travelData = await response.json();

    const countryData = travelData[countryName];
    if (!countryData || !Array.isArray(countryData.cities)) {
      console.warn("❌ No valid travel data found for:", countryName);
      return;
    }

    const tableBody = document.getElementById("city-table-body");
    tableBody.innerHTML = "";

    const topCities = countryData.cities.slice(0, 5);

    topCities.forEach((city) => {
      city.sights.forEach((sight, index) => {
        const row = document.createElement("tr");

        if (index === 0) {
          const cityCell = document.createElement("td");
          cityCell.textContent = city.name;
          cityCell.rowSpan = city.sights.length;
          cityCell.classList.add("city-column");
          row.appendChild(cityCell);
        }

        const attractionCell = document.createElement("td");
        attractionCell.textContent = sight.name;
        attractionCell.style.fontWeight = "bold";
        row.appendChild(attractionCell);

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = sight.description;
        row.appendChild(descriptionCell);

        const kidCell = document.createElement("td");
        kidCell.textContent = sight.kidFriendly ? "Yes" : "No";
        kidCell.setAttribute(
          "data-translate",
          sight.kidFriendly ? "yes" : "no",
        );
        row.appendChild(kidCell);

        const accessCell = document.createElement("td");
        accessCell.textContent = sight.accessibility;
        row.appendChild(accessCell);

        const hoursCell = document.createElement("td");
        hoursCell.textContent = sight.hours;
        row.appendChild(hoursCell);

        const costCell = document.createElement("td");
        costCell.textContent = sight.cost;
        row.appendChild(costCell);

        tableBody.appendChild(row);
      });
    });
    // Translate table if needed
    if (currentLang === "es" && typeof window.translatePage === "function") {
      window.translatePage("es");
    }
  } catch (err) {
    console.error("❌ Failed to load travel tips:", err);
  }
}

// Fetches latest news articles using GNews API and lists them
async function loadCountryNews(countryName) {
  const apiKey = "4689d3035f1deef5f7b65b365a990ebf";
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(countryName + " travel OR tourism")}&lang=en&max=3&token=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GNews error: ${res.status}`);
    const data = await res.json();

    const list = document.getElementById("news-list");
    list.innerHTML = "";

    if (!data.articles?.length) {
      list.innerHTML = "<li>No recent travel news available.</li>";
      return;
    }

    data.articles.forEach((article) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a>`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Error loading news:", err);
    document.getElementById("news-list").innerHTML =
      "<li>News fetch failed.</li>";
  }
}

// Loads weather forecast for the country's capital using WeatherAPI
async function loadWeatherForecast(capitalCity) {
  const apiKey = "34f72d582c6149c7977171819252003";
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(capitalCity)}&days=7&aqi=no&alerts=no`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    const data = await res.json();

    const forecastContainer = document.getElementById("weather-forecast");
    forecastContainer.innerHTML = "";

    data.forecast.forecastday.forEach((day) => {
      const date = new Date(day.date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const dayCard = document.createElement("div");
      dayCard.classList.add("weather-day");
      dayCard.innerHTML = `
                <p><strong>${date}</strong></p>
                <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" />
                <p>${day.day.condition.text}</p>
                <p>🌡️ ${day.day.avgtemp_c}°C</p>
            `;
      forecastContainer.appendChild(dayCard);
    });
  } catch (err) {
    console.error("❌ Weather API error:", err);
    document.getElementById("weather-forecast").innerHTML =
      "<p>Weather data not available.</p>";
  }
}

const form = document.querySelector("#country-form");
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.querySelector("#country-input");
  const query = input.value.trim();
  if (!query) return;
  history.pushState({}, "", `?country=${encodeURIComponent(query)}`);
  await initCountryPage();
});

// Expose globally for translate.js and others
window.displayCountryInfo = displayCountryInfo;
window.loadTravelTips = loadTravelTips;
window.getLoadedCountry = () => loadedCountry;

