// i18n.js - Internationalization Setup
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: { /* your translations */ } },
      'en-US': { translation: { /* your translations */ } },
      'es': { translation: { /* your translations */ } }
    },
    lng: "pt-BR",
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;