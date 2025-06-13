const toggleBtn = document.getElementById("translate-toggle");
let currentLang = localStorage.getItem("lang") || "en";

// Set button label on load and translate if needed
document.addEventListener("DOMContentLoaded", () => {
  currentLang = localStorage.getItem("lang") || "en";
  toggleBtn.textContent = currentLang === "es" ? "🌐 English" : "🌐 Español";

  // Esperar medio segundo antes de traducir para asegurarse que el DOM esté completamente renderizado
  setTimeout(() => {
    translatePage(currentLang);
  }, 500);
});

async function translatePage(toLang) {
  const elements = document.querySelectorAll("[data-translate]");
  const placeholders = document.querySelectorAll(
    "[data-translate-placeholder]",
  );
  const textList = [
    ...Array.from(elements).map((el) => el.textContent.trim()),
    ...Array.from(placeholders).map((el) => el.placeholder.trim()),
  ];

  if (textList.length === 0) {
    console.warn("⚠️ No elements to translate.");
    return;
  }

  try {
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

    const translations = data.data.translations;
    translations.forEach((t, i) => {
      if (i < elements.length) {
        elements[i].textContent = t.translatedText;
      } else {
        const placeholderIndex = i - elements.length;
        placeholders[placeholderIndex].placeholder = t.translatedText;
      }
    });

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

    // ✅ Update lang state
    currentLang = toLang;
    localStorage.setItem("lang", currentLang);

    // 🗺 If on country page, reload dynamic table
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
  } catch (err) {
    console.error("❌ Translation failed:", err);
  }
}

toggleBtn.addEventListener("click", async () => {
  const target = currentLang === "en" ? "es" : "en";

  // ✅ Cambia primero el idioma actual y guarda en localStorage
  currentLang = target;
  localStorage.setItem("lang", currentLang);

  // ✅ Actualiza el texto del botón inmediatamente
  toggleBtn.textContent = currentLang === "en" ? "🌐 Español" : "🌐 English";

  // ✅ Aplica la traducción
  await translatePage(currentLang);
});

// Expose to other modules
window.translatePage = translatePage;
