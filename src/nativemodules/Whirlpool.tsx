import { NativeModules } from 'react-native';

const { Whirlpool } = NativeModules;

export default class WhirlpoolServices {
  static hello = async (name: string): Promise<string> => {
    try {
      const result = await Whirlpool.sayHello(name);
      return result;
    } catch (error) {
      console.log('error', error);
      throw new Error(error);
    }
  };

  static initiateWhirlpool = async () => {
    try {
      const result = await Whirlpool.initiate();
      return result;
    } catch (error) {
      console.log('error', error);
      throw new Error(error);
    }
  };

  static getPools = async (): Promise<[]> => {
    try {
      const result = await Whirlpool.getPools();
      if (result) {
        return JSON.parse(result)
      }
      return []
    } catch (error) {
      console.log('error', error);
      throw new Error(error);
    }
  };

  static getTx0Data = async (): Promise<[]> => {
    try {
      const result = await Whirlpool.getTx0Data();
      if (result) {
        return JSON.parse(result)
      }
      return []
    } catch (error) {
      console.log('error', error);
      throw new Error(error);
    }
  };
}
