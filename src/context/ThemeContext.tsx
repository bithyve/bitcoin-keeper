import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { useSelector } from 'react-redux';
import customTheme from 'src/navigation/themes';
import privateTheme from 'src/navigation/privateTheme';

const ThemeContextProvider = ({ children }: any) => {
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);

  const selectedTheme =
    themeMode === 'PRIVATE' || themeMode === 'PRIVATE_LIGHT' ? privateTheme : customTheme;

  return <NativeBaseProvider theme={selectedTheme}>{children}</NativeBaseProvider>;
};

export default ThemeContextProvider;
