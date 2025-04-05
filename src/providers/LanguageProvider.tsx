import { createContext, useContext, useEffect, useState } from "react";
import { 
  ptBR_translations, 
  enUS_translations, 
  esES_translations,
  type LanguageCode,
  type TranslationKey,
  type Translation,
  availableLanguages
} from "@/translations";

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
};

const translations: Record<LanguageCode, Translation> = {
  "pt-BR": ptBR_translations,
  "en-US": enUS_translations,
  "es-ES": esES_translations,
  "fr-FR": enUS_translations, // fallback to English
  "de-DE": enUS_translations, // fallback to English
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<LanguageCode>("pt-BR");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as LanguageCode;
    if (savedLanguage && availableLanguages[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations["en-US"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
