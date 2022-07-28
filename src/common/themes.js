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
      white1: '#FFFFFF',
      lightBlack: '#041513',
      lightBlack2: '#5F6965',
      brown: '#D8A572',
      textBlack: '#092C27',
      greenText: '#073E39',
      greenText2: '#017963',
      lightBlue: '#62C5BF',
      darkBackground: '#232523',
      textLight: '#FAFCFC',
      textDark: '#30292F',
      yellow1: '#FAC48B',
      QrCode: '#E8E0D9',
      recieverAddress: '#6C6C6C',
      textInputBackground: '#FCF6EF',
      ReceiveBackground: '#F7F2EC',
      GreyText: '#4F5955',
      KnowMoreButton: '#045647',
      dateText: '#50756E',
      Border: '#005545',
      vaultCard: '#B2844E',
      borderColor: '#EBB67A',
      borderColor2: '#D5B690',
      textColor: '#CDD8D6',
      textColor2: '#4E5C6A',
      headerText: '#00715B',
      copyBackground: '#CDD8D6',
      seedText: '#4A4A4A',
      borderSaperator: '#BDB7B1',
      sendCardHeading: '#064D41',
      AddSignerCard: '#3D7E6E',
      TorLable: '#C6ECAE',
      headerTextTwo: '#003423',
      divider: '#BABABA',
      errorRed: '#ff0033',
      textWallet: '#113834',
      transactionPolicyCard: '#FAD8B4',
      inheritanceBullet: '#E3E3E3',
      inheritanceTitle: '#055146',
      modalText: '#073B36'
    },
    dark: {
      black: '#000000',
    },
  },
  config: {
    initialColorMode: 'light',
  },
});
