import { MMKV } from 'react-native-mmkv';
import React, { createContext, useState } from 'react';
import * as RNLocalize from 'react-native-localize';
import en from './language/en.json';
import es from './language/es.json';
src / components / CloudBackup / CreateCloudBackup.tsx;
import LocalizedContent from 'react-localization';

export const Storage = new MMKV();

const DEFAULT_LANGUAGE = 'en';
const APP_LANGUAGE = 'appLanguage';

const languages = {
  en,
  es,
};
export const translations = new LocalizedContent(languages);

export const LocalizationContext = createContext({
  translations,
  setAppLanguage: () => {},
  appLanguage: DEFAULT_LANGUAGE,
  initializeAppLanguage: () => {},
});

export const LocalizationProvider = ({ children }) => {
  const [appLanguage, setAppLanguage] = useState(DEFAULT_LANGUAGE);

  const setLanguage = (language) => {
    translations.setLanguage(language);
    setAppLanguage(language);
    Storage.set(APP_LANGUAGE, language);
  };

  const formatString = (...param) => {
    return translations.formatString(...param);
  };

  const initializeAppLanguage = async () => {
    const currentLanguage = await Storage.getString(APP_LANGUAGE);
    if (currentLanguage) {
      setLanguage(currentLanguage);
      //moment.locale( currentLanguage )
    } else {
      let localeCode = DEFAULT_LANGUAGE;
      const supportedLocaleCodes = translations.getAvailableLanguages();
      const phoneLocaleCodes = RNLocalize.getLocales().map((locale) => locale.languageCode);
      phoneLocaleCodes.some((code) => {
        if (supportedLocaleCodes.includes(code)) {
          localeCode = code;
          return true;
        }
      });
      //moment.locale( localeCode )
      setLanguage(localeCode);
    }
  };

  return (
    <LocalizationContext.Provider
      value={{
        translations,
        setAppLanguage: setLanguage,
        appLanguage,
        initializeAppLanguage,
        formatString,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};
