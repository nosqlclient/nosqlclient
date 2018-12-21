import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import translationEN from './locales/en/translation.json';

const resources = { en: { translation: translationEN } };

i18n
  .use(reactI18nextModule)
  .init({
    resources,
    lng: 'en',
    keySeparator: false,
    interpolation: { escapeValue: false }
  });

export default i18n;
