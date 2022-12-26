import React from 'react';
import { NativeBaseProvider } from 'native-base';

import LinearGradient from 'src/components/KeeperGradient';
import { customTheme } from '../common/themes';

const config = {
  dependencies: {
    'linear-gradient': LinearGradient,
  },
};

function Provider() {
  return <NativeBaseProvider theme={customTheme} config={config} />;
}

export default Provider;
