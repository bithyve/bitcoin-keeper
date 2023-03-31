import { Psbt } from 'bitcoinjs-lib';
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

  /**
 * @param  {tx_str} inputsValue
 * @param  {pool_id_str} premixFeePerByte
 * @returns string
 */
  static tx0Push = async (
    txStr: string,
    poolIdStr: string,
  ): Promise<string> => {
    try {
      const result = await Whirlpool.tx0push(
        txStr,
        poolIdStr,
      );
      if (!result) throw new Error('Unable to tx0Push');
      return result;
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  }

  /**
  * @returns Psbt
  */
  static intoPsbt = async (
    previewStr: string,
    tx0DataStr: string,
    inputsStr: string,
    addressBankStr: string,
    changeAddrStr: string
  ): Promise<Psbt> => {
    try {
      const result = await Whirlpool.intoPsbt(
        previewStr,
        tx0DataStr,
        inputsStr,
        addressBankStr,
        changeAddrStr
      );
      if (!result) throw new Error('Unable to call intoPsbt');
      return JSON.parse(result);
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  }

  /**
  * @returns Psbt
  */
  static constructInput = async (
    outpoint: string,
    value: number,
    scriptPubkey: string
  ): Promise<string> => {
    try {
      const result = await Whirlpool.constructInput(
        outpoint,
        value,
        scriptPubkey
      );
      if (!result) throw new Error('Unable to call intoPsbt');
      return result;
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  }

  /**
  */
  static startMix = async (
    input: string,
    privateKey: string,
    destination: string,
    poolId: string,
    denomination: string,
    preUserHash: string,
    network: string,
    blockHeight: string
  ): Promise<string> => {
    try {
      const result = await Whirlpool.blocking(
        input,
        privateKey,
        destination,
        poolId,
        denomination,
        preUserHash,
        network,
        blockHeight
      );
      if (!result) throw new Error('Unable to generate tx0 preview');
      return result;
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  }
}
