import { Dimensions, Platform } from 'react-native';
const windowHeight = Dimensions.get('window').height;

export const getResponsiveHome = () => {
  if (windowHeight >= 850) {
    return {
      padingTop: 7,
      marginTop: 0,
      height: 35,
    };
  } else if (windowHeight >= 750) {
    return {
      padingTop: 10,
      marginTop: -2,
      height: 38,
    };
  } else if (windowHeight >= 650 && Platform.OS == 'android') {
    return {
      padingTop: 10,
      marginTop: 0,
      height: 42,
    };
  } else if (windowHeight >= 650) {
    return {
      padingTop: 14,
      marginTop: -8,
      height: 42,
    };
  } else {
    return {
      padingTop: 16,
      marginTop: -9,
      height: 44,
    };
  }
};