// Import function to fetch multiple images for a country from Unsplash
import { getCountryImages } from "./Unsplash.mjs";

// Main function to render the wishlist from localStorage
function loadWishlist() {
  const container = document.getElementById("wishlist-container");
  if (!container) return;

  // Retrieve saved wishlist or initialize with an empty array
  const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
  container.innerHTML = "";

  if (saved.length === 0) {
    container.innerHTML =
      '<p class="empty-message" data-translate="empty_wishlist">Your wishlist is empty. Start exploring!</p>';
    return;
  }

  saved.forEach(async (country) => {
    const wrapper = document.createElement("li");
    wrapper.classList.add("wishlist-country");

    wrapper.innerHTML = `
      <h2><a href="country.html?country=${encodeURIComponent(country)}">${country}</a></h2>
      <div class="gallery-row">
          <div class="gallery-img" id="${country}-img-1"></div>
          <div class="gallery-img" id="${country}-img-2"></div>
          <div class="gallery-img" id="${country}-img-3"></div>
          <div class="gallery-img" id="${country}-img-4"></div>
      </div>
      <div class="notes-wrapper">
          <textarea
              id="note-${country}" 
              placeholder="Notes about ${country}..." 
              data-translate-placeholder="note_about_country"
              data-country-name="${country}"
          ></textarea>
          <span class="note-status" id="status-${country}" aria-live="polite"></span>
          <button class="remove-btn" data-country="${country}" data-translate="remove_button">🗑 Remove</button>
      </div>
    `;

    container.appendChild(wrapper);

    // Load and set 4 background images from Unsplash
    try {
      const urls = await getCountryImages(country, 4);
      urls.forEach((url, index) => {
        const imgBox = document.getElementById(`${country}-img-${index + 1}`);
        if (imgBox) {
          imgBox.style.backgroundImage = `url('${url}')`;
          imgBox.setAttribute("role", "img");
          imgBox.setAttribute("aria-label", `Image of ${country}`);
        }
      });
    } catch (error) {
      console.warn(`Failed to load images for ${country}`, error);
    }

    // Notes section - load saved notes from localStorage
    const noteKey = `note-${country}`;
    const textarea = document.getElementById(`note-${country}`);
    const statusEl = document.getElementById(`status-${country}`);
    textarea.value = localStorage.getItem(noteKey) || "";

    let debounce;
    textarea.addEventListener("input", () => {
      clearTimeout(debounce);
      statusEl.textContent = "💾 Saving...";

      debounce = setTimeout(() => {
        localStorage.setItem(noteKey, textarea.value);
        statusEl.textContent = "✅ Saved!";
        setTimeout(() => (statusEl.textContent = ""), 2000);
      }, 300);
    });

    // Remove country from wishlist and refresh list
    wrapper.querySelector(".remove-btn").addEventListener("click", () => {
      const updated = saved.filter((c) => c !== country);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      localStorage.removeItem(noteKey);
      loadWishlist();
    });
  });
}
// Initialize the wishlist view on page load
loadWishlist();
// Expose the translation function globally if needed
window.translatePage = translatePage;
