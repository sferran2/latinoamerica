const accessKey = "XdyrW08a4T5wwmRFv9B-tp7NMl1vshxcWslOhdq3OC0";

export async function getCountryImage(countryName) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    countryName + " travel",
  )}&orientation=landscape&per_page=1&client_id=${accessKey}`;

  const res = await fetch(url);
  const data = await res.json();

  const img = data.results?.[0];
  if (!img) throw new Error("No image found for " + countryName);

  return {
    url: img.urls.regular,
    alt: img.alt_description || `Image of ${countryName}`,
  };
}

export async function getCountryImages(countryName, count = 4) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    countryName + " travel",
  )}&orientation=landscape&per_page=${count}&client_id=${accessKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`No images found for ${countryName}`);
  }

  return data.results.map((img) => img.urls.regular);
}
