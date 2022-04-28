import { extendTheme } from 'native-base';
import Fonts from './Fonts';
export const customTheme = extendTheme({
  fontConfig: {
    Roboto: {
      100: {
        normal: Fonts.RobotoCondensedLight,
        italic: Fonts.RobotoCondensedLightItalic,
      },
      200: {
        normal: Fonts.RobotoCondensedRegular,
        italic: Fonts.RobotoCondensedItalic,
      },
      300: {
        normal: Fonts.RobotoCondensedBold,
        italic: Fonts.RobotoCondensedBoldItalic,
      },
    },
  },
  fonts: {
    heading: 'Roboto',
    body: 'Roboto',
    mono: 'Roboto',
  },

  colors: {
    light: {
      light: '#00836A',
      lightYellow: '#FDF7F0',
      white: '#FAFAFA',
      lightBlack: '#041513',
      brown: '#D8A572',
      textBlack: '#092C27',
      greenText: '#073E39',
      lightBlue: '#62C5BF',
    },
    dark: {
      black: '#000000',
    },
  },
  config: {
    initialColorMode: 'light',
  },
});
