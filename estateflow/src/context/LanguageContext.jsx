// Language context — Hindi / English toggle
// Persists preference in localStorage

import { createContext, useContext, useState } from "react";
import en from "../i18n/en";
import hi from "../i18n/hi";

const translations = { en, hi };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("ef-lang") || "en";
  });

  function toggleLanguage() {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    localStorage.setItem("ef-lang", next);
  }

  function setLanguage(l) {
    setLang(l);
    localStorage.setItem("ef-lang", l);
  }

  // t() — translate a key
  function t(key) {
    return translations[lang]?.[key] || translations.en?.[key] || key;
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
