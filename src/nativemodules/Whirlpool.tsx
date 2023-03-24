import { NativeModules, Platform } from 'react-native';

const { Whirlpool } = NativeModules;

export default class WhirlpoolService {
  static hello = async (name: string) => {
    try {
      const result = await Whirlpool.sayHello(name);
      return result;
    } catch (error) {
      console.log('error', error);
      throw new Error(error);
    }
  };

  static initiate = async (torPort: string) => {
    try {
      const result = await Whirlpool.initiate(torPort);
      return result;
    } catch (error) {
      console.log('error', error);
      throw new Error(error);
    }
  };

  static getTx0Data = async (torPort: string) => {
    try {
      const result = await Whirlpool.getTx0Data(torPort);
      return result;
    } catch (error) {
      console.log('error', error);
      throw new Error(error);
    }
  };

  static getPools = async (torPort: string) => {
    try {
      const result = await Whirlpool.getPools(torPort);
      return result;
    } catch (error) {
      console.log('error', error);
      throw new Error(error);
    }
  };
}
