import React from 'react';
import { NativeBaseProvider } from 'native-base';

import { customTheme } from '../theme';

const Provider = () => {
  return (
    <NativeBaseProvider theme={customTheme}>
    </NativeBaseProvider>
  );
};

export default Provider;