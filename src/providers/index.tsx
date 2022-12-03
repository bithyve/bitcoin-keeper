import React from 'react';
import { NativeBaseProvider } from 'native-base';

import { customTheme } from '../common/themes';

function Provider() {
  return (
    <NativeBaseProvider theme={customTheme} />
  );
}

export default Provider;