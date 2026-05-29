import React, { useMemo } from 'react';
import { NativeBaseProvider } from '@gluestack-ui/themed-native-base';
import { useSelector } from 'react-redux';
import { cloneDeep } from 'lodash';
import customTheme from 'src/navigation/themes';
import privateTheme from 'src/navigation/privateTheme';

const ThemeContextProvider = ({ children }: any) => {
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);

  const selectedTheme =
    themeMode === 'PRIVATE' || themeMode === 'PRIVATE_LIGHT' ? privateTheme : customTheme;

  const themeForProvider = useMemo(() => cloneDeep(selectedTheme), [selectedTheme]);

  return <NativeBaseProvider theme={themeForProvider}>{children}</NativeBaseProvider>;
};

export default ThemeContextProvider;
