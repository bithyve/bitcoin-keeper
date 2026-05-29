import React from 'react';
import { NativeBaseProvider } from '@gluestack-ui/themed-native-base';

import { customTheme } from '../navigation/themes';

function Provider() {
  return <NativeBaseProvider theme={customTheme} />;
}

export default Provider;
