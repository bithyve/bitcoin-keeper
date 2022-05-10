import { extendTheme } from 'native-base';
import Colors from './Colors';

export const HexaTheme = extendTheme({
  colors: {
    light: {},
    dark: {},
  },
  config: {
    initialColorMode: 'light',
  },
});
