import { NativeModules, Platform } from 'react-native';

const { Whirlpool } = NativeModules;

export const hello = async () => {
  try {
    const result = await Whirlpool.hello_world();
    console.log('result', result);
    return result;
  } catch (error) {
    console.log('error', error);
    throw new Error(error);
  }
};
