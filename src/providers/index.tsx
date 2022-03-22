import React from 'react';
import { NativeBaseProvider } from 'native-base';

import { customTheme } from '../common/themes';

const Provider = () => {
  return (
    <NativeBaseProvider theme={customTheme}>
    </NativeBaseProvider>
  );
};

export default Provider;