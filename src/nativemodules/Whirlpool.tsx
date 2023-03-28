import { NativeModules } from 'react-native';

const { Whirlpool } = NativeModules;

export const hello = async () => {
  try {
    const result = await Whirlpool.hello('test');
    console.log('result', result);
    return result;
  } catch (error) {
    console.log('error', error);
    throw new Error(error);
  }
};

export const initiateWhirlpool = async () => {
  try {
    const result = await Whirlpool.initiate('asdf');
    console.log('result', result);
    return result;
  } catch (error) {
    console.log('error', error);
    throw new Error(error);
  }
};

export const pools = async () => {
  try {
    const result = await Whirlpool.getPools('asdf');
    console.log('result', result);
    return result;
  } catch (error) {
    console.log('error', error);
    throw new Error(error);
  }
};
