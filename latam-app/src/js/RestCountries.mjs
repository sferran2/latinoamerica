const API_URL = "https://restcountries.com/v3.1";

export async function searchCountryByName(name) {
  const url = `https://corsproxy.io/?${API_URL}/name/${encodeURIComponent(name)}?fullText=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Country not found");
  }

  const data = await response.json();
  return data[0];
}
