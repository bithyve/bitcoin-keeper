import { Dimensions } from 'react-native';

export const windowHeight: number = Dimensions.get('window').height;
export const windowWidth: number = Dimensions.get('window').width;

export const getTransactionPadding = () => windowHeight * 0.047;

export const hp = (height: number) => (height / 812) * windowHeight

export const wp = (width: number) => (width / 375) * windowWidth