import { Dimensions, Platform } from 'react-native';
export const windowHeight: number = Dimensions.get('window').height;
export const windowWidth: number = Dimensions.get('window').width;

export const getTransactionPadding = () => {
  return windowHeight * 0.047;
};

export const hp = (height: number) => {
  return (height / 812) * windowHeight
}

export const wp = (width: number) => {
  return (width / 375) * windowWidth
}