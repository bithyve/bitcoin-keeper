import Colors from 'src/theme/Colors';
import Fonts from './Fonts';
import { extendTheme } from 'native-base';
export const customTheme = extendTheme({

  fontConfig: {
    'RobotoCondensed-Regular': {
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
    heading: 'RobotoCondensed-Regular',
    body: 'RobotoCondensed-Regular',
    mono: 'RobotoCondensed-Regular',
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
      brownborder: '#725436',
      textBlack: '#092C27',
      greenText: '#073E39',
      greenText2: '#017963',
      lightBlue: '#62C5BF',
      darkBackground: '#232523',
      textLight: '#FAFCFC',
      textDark: '#30292F',
      yellow1: '#FAC48B',
      yellow2: '#E3BE96',
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
      blackHeaderText: '#092C27',
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
      modalText: '#073B36',
      indicator: '#F86B50',
      addTransactionText: '#252C23',
      sendMax: '#453228',
      inActiveMsg: '#959595',
      vaultCardText: '#FFE5C6',
      sats: '#CEDFD8',
      satsDark: '#486560',
      time: '#3D4252',
      lgStart: Colors.linearGradientStart, // linearGradient
      lgEnd: Colors.linearGradientEnd, // linearGradient
      error: '#FF8F79',
    },
    dark: {
      black: '#000000',
    },
  },
  config: {
    initialColorMode: 'light',
  },
  components: {
    Text: {
      baseStyle: (props) => {
        return {
          _light: {
            color: 'light.lightBlack',
            fontFamily: 'RobotoCondensed-Regular'
          },
          _dark: { color: 'dark.black' },

        };
      },
    }
  }
});
