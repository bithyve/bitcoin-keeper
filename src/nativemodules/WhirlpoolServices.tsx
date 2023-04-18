import { NativeModules, Platform } from 'react-native';
import { R } from 'react-native-shadow-2';
import { WhirlpoolInput, InputStructure, PoolData, Preview, TX0Data } from './interface';

const { Whirlpool } = NativeModules;

export default class WhirlpoolServices {
  /**
   * whirlpool mixing pools provider: fetches pool info from the coordinator
   * @returns {Promise<PoolData[]>} PoolData[]
   */
  static getPools = async (): Promise<PoolData[] | boolean> => {
    try {
      let result = await Whirlpool.getPools();
      result = JSON.parse(result);
      if (result.length > 0) {
        return result;
      } else return false;
    } catch (error) {
      console.log({ error });
      return false;
    }
  };

  /**
   * Fetches TX0 data from the coordinator.
   * @returns {Promise<Tx0Data[]>} Tx0Data[]
   */
  static getTx0Data = async (): Promise<TX0Data[] | boolean> => {
    try {
      let result = await Whirlpool.getTx0Data();
      result = JSON.parse(result);
      if (result.length > 0) return result;
      else return false;
    } catch (error) {
      console.log({ error });
      return false;
    }
  };

  /**
   * Computes a TX0 preview containing output values that can be used to construct a real TX0.
   * If err, it means that the total value of inputs is insufficient to successully construct one.
   * @param  {number} inputsValue
   * @param  {PoolData} pool
   * @param  {string} feeAddress
   * @param  {InputStructure} inputStructure
   * @param  {number} minerFeePerByte
   * @param  {number} coordinatorFee
   * @param  {string} nWantedMaxOutputsStr
   * @param  {number} nPoolMaxOutputs
   * @param  {number} premixFeePerByte
   * @returns {Promise<Preview>} Preview
   */
  static getTx0Preview = async (
    inputsValue: number,
    pool: PoolData,
    feeAddress: string,
    inputStructure: InputStructure,
    minerFeePerByte: number,
    coordinatorFee: number,
    nWantedMaxOutputsStr: string,
    nPoolMaxOutputs: number,
    premixFeePerByte: number
  ): Promise<Preview | false> => {
    try {
      let result;
      if (Platform.OS === 'ios') {
        result = await Whirlpool.tx0Preview(
          `${inputsValue}`,
          JSON.stringify(pool),
          feeAddress,
          JSON.stringify(inputStructure),
          `${minerFeePerByte}`,
          `${coordinatorFee}`,
          nWantedMaxOutputsStr,
          `${nPoolMaxOutputs}`,
          `${premixFeePerByte}`
        );
      } else {
        result = await Whirlpool.tx0Preview(
          `${inputsValue}`,
          JSON.stringify(pool),
          `${premixFeePerByte}`,
          feeAddress,
          JSON.stringify(inputStructure),
          `${minerFeePerByte}`,
          `${coordinatorFee}`,
          nWantedMaxOutputsStr,
          `${nPoolMaxOutputs}`
        );
      }
      if (!result) {
        throw new Error('Failed to generate tx0 preview');
      }
      result = JSON.parse(result);
      if (result.premixValue) return result;
      else return false;
    } catch (error) {
      console.log({ error });
      return false;
    }
  };

  /**
   * Constructs Tx0 from Preview and returns the correspodning serializedPSBT for signing
   * @param  {Preview} preview
   * @param  {TX0Data} tx0data
   * @param  {WhirlpoolInput[]} inputs
   * @param  {string[]} addressBank
   * @param  {string} changeAddress
   * @returns {Promise<string>} PSBT(base64-hex)
   */
  static previewToPSBT = async (
    preview: Preview,
    tx0Data: TX0Data,
    inputs: WhirlpoolInput[],
    addressBank: string[],
    changeAddress: string
  ): Promise<string | false> => {
    try {
      const result = await Whirlpool.intoPsbt(
        JSON.stringify(preview),
        JSON.stringify(tx0Data),
        JSON.stringify(inputs),
        JSON.stringify(addressBank),
        changeAddress
      );
      if (!result) return false;
      return result;
    } catch (error) {
      console.log({ error });
      return false;
    }
  };

  /**
   * validates and broadcasts tx0 via whirlpool coordinator
   * @param  {string} txHex
   * @param  {string} poolId
   * @returns {Promise<string>} txid
   */
  static tx0Push = async (txHex: string, poolId: string): Promise<string> => {
    try {
      const result = await Whirlpool.tx0Push(txHex, poolId);
      if (!result) throw new Error('Failed to broadcast tx0');
      return result;
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  };

  /**
   * starts a new Whirlpool mix in the current thread in a blocking manner
   * @param  {WhirlpoolInput} input
   * @param  {string} privateKey
   * @param  {string} destination
   * @param  {string} poolId
   * @param  {string} denomination
   * @param  {string} preUserHash
   * @param  {string} network
   * @param  {string} blockHeight
   * @param  {string} signedRegistrationMessage
   * @returns {Promise<string>} txid
   */
  static startMix = async (
    input: WhirlpoolInput,
    privateKey: string,
    destination: string,
    poolId: string,
    denomination: string,
    preUserHash: string,
    network: string,
    blockHeight: string,
    signedRegistrationMessage: string,
    appId: string
  ): Promise<string> => {
    try {
      const result = await Whirlpool.blocking(
        JSON.stringify(input),
        privateKey,
        destination,
        poolId,
        denomination,
        preUserHash,
        network,
        blockHeight,
        signedRegistrationMessage,
        appId
      );
      if (!result) throw new Error('Unable to mix the current input');
      return result;
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  };
}
