// Get the language toggle button and initial language from localStorage
const toggleBtn = document.getElementById("translate-toggle");
let currentLang = localStorage.getItem("lang");

if (!currentLang) {
  currentLang = "en";
  localStorage.setItem("lang", "en");
}

// Set button label on load and translate if needed
document.addEventListener("DOMContentLoaded", () => {
  currentLang = localStorage.getItem("lang") || "en";
  toggleBtn.textContent = currentLang === "es" ? "🌐 English" : "🌐 Español";

  // Only auto-translate if it's Spanish
  if (currentLang === "es") {
    setTimeout(() => {
      translatePage("es");
    }, 300); // shorter delay is fine
  }
});


// Main translation function using the Google Translate API
async function translatePage(toLang) {
  console.log("Translating to:", toLang);
  const elements = document.querySelectorAll("[data-translate]");
  const placeholders = document.querySelectorAll(
    "[data-translate-placeholder]",
  );

  elements.forEach((el) => {
    if (!el.hasAttribute("data-original")) {
      el.setAttribute("data-original", el.textContent.trim());
    }
  });

  placeholders.forEach((el) => {
    if (!el.hasAttribute("data-original")) {
      el.setAttribute("data-original", el.placeholder.trim());
    }
  });

  // 🟡 If switching back to English, restore original content
  if (toLang === "en") {
    elements.forEach((el) => {
      el.textContent = el.getAttribute("data-original") || el.textContent;
    });
    placeholders.forEach((el) => {
      el.placeholder = el.getAttribute("data-original") || el.placeholder;
    });

    localStorage.setItem("lang", "en");
    return;
  }

  const textList = [
    ...Array.from(elements).map((el) => el.textContent.trim()),
    ...Array.from(placeholders).map((el) => el.placeholder.trim()),
  ];

  if (textList.length === 0) {
    console.warn("⚠️ No elements to translate.");
    return;
  }

  try {
    // Make API request to Google Translate
    const res = await fetch(
      "https://translation.googleapis.com/language/translate/v2?key=AIzaSyCKn03_MC5NWdNMSotEOPDudEbF1okTo2k",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: textList,
          target: toLang,
          format: "text",
        }),
      },
    );

    const data = await res.json();
    if (!data.data?.translations) {
      console.error("❌ Unexpected response from API:", data);
      return;
    }

    // Update visible text and placeholders with translated content
    const translations = data.data.translations;
    translations.forEach((t, i) => {
      if (i < elements.length) {
        elements[i].textContent = t.translatedText;
      } else {
        const placeholderIndex = i - elements.length;
        placeholders[placeholderIndex].placeholder = t.translatedText;
      }
    });

    // Custom handling for placeholders that reference country names
    document
      .querySelectorAll("[data-translate-placeholder='note_about_country']")
      .forEach((el) => {
        const country = el.getAttribute("data-country-name") || "";
        if (toLang === "es") {
          el.placeholder = `Notas sobre ${country}...`;
        } else {
          el.placeholder = `Notes about ${country}...`;
        }
      });

    // Save the new language setting in localStorage
    currentLang = toLang;
    localStorage.setItem("lang", currentLang);

  } catch (err) {
    console.error("❌ Translation failed:", err);
  }
}

// Toggle the language on button click and apply translation
toggleBtn.addEventListener("click", async () => {
  const target = currentLang === "en" ? "es" : "en";

  currentLang = target;
  localStorage.setItem("lang", currentLang);

  toggleBtn.textContent = currentLang === "en" ? "🌐 Español" : "🌐 English";

  await translatePage(currentLang);

  // If we're on a country page, reload the localized travel tips table
  if (typeof window.getLoadedCountry === "function") {
    const country = window.getLoadedCountry();
    if (
      country &&
      country.name?.common &&
      typeof window.loadTravelTips === "function"
    ) {
      window.loadTravelTips(country.name.common);
    }
  }
});


// Expose translation function globally for other modules
window.translatePage = translatePage;
