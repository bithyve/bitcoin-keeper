import { NativeModules } from 'react-native';
import { InputStructure, PoolData, Preview, TX0Data } from './interface';

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

  /**
   * Computes a TX0 preview containing output values that can be used to construct a real TX0.
   * If err, it means that the total value of inputs is insufficient to successully construct one.
   * @param  {number} inputsValue
   * @param  {PoolData} pool
   * @param  {number} premixFeePerByte
   * @param  {InputStructure} inputStructure
   * @param  {number} minerFeePerByte
   * @param  {number} coordinatorFee
   * @param  {string} nWantedMaxOutputsStr
   * @param  {number} nPoolMaxOutputs
   * @returns Preview
   */
  static getTx0Preview = async (
    inputsValue: number,
    pool: PoolData,
    premixFeePerByte: number,
    inputStructure: InputStructure,
    minerFeePerByte: number,
    coordinatorFee: number,
    nWantedMaxOutputsStr: string,
    nPoolMaxOutputs: number
  ): Promise<Preview> => {
    try {
      const result = await Whirlpool.tx0Preview(
        inputsValue,
        JSON.stringify(pool),
        premixFeePerByte,
        JSON.stringify(inputStructure),
        minerFeePerByte,
        coordinatorFee,
        nWantedMaxOutputsStr,
        nPoolMaxOutputs
      );
      if (!result) throw new Error('Unable to generate tx0 preview');

      return JSON.parse(result);
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  };
}
