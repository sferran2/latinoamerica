const UNSPLASH_ACCESS_KEY = "He3g0nco3fHhMqKolj6dNCcjfdorOXCNmW1x0ueUBag"; 

export async function getCountryImage(countryName) {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        countryName
    )}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Unsplash image not found");
    }

    const data = await response.json();
    // Return the first image URL or a fallback
    return data.results.length > 0
        ? data.results[0].urls.regular
        : null;
  }
