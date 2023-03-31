import { NativeModules } from 'react-native';
import { PoolData, TX0Data } from './interface';

const { Whirlpool } = NativeModules;

export default class WhirlpoolServices {
  /**
   * whirlpool mixing pools provider: fetches pool info from the coordinator
   * @returns Promise<PoolData[]>
   */
  static getPools = async (): Promise<PoolData[]> => {
    try {
      const result = await Whirlpool.getPools();
      if (!result) throw new Error('Unable to fetch pools data');

      return JSON.parse(result);
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  };

  /**
   * Fetches TX0 data from the coordinator.
   * @returns Promise<Tx0Data[]>
   */
  static getTx0Data = async (): Promise<TX0Data[]> => {
    try {
      const result = await Whirlpool.getTx0Data();
      if (!result) throw new Error('Unable to fetch tx0 data');

      return JSON.parse(result);
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  };
}
