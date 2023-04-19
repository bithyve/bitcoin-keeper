import { NativeModules, Platform } from 'react-native';
import { logMessage } from 'src/core/services/sentry';
import { WhirlpoolInput, InputStructure, PoolData, Preview, TX0Data } from './interface';

const { Whirlpool } = NativeModules;

export default class WhirlpoolServices {
  /**
   * whirlpool mixing pools provider: fetches pool info from the coordinator
   * @returns {Promise<PoolData[]>} PoolData[]
   */
  static getPools = async (): Promise<PoolData[]> => {
    try {
      let result = await Whirlpool.getPools();
      result = JSON.parse(result);
      if (result.error) {
        console.log({ error: result.error });
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      logMessage(error);
      throw error;
    }
  };

  /**
   * Fetches TX0 data from the coordinator.
   * @returns {Promise<Tx0Data[]>} Tx0Data[]
   */
  static getTx0Data = async (scode = ''): Promise<TX0Data[]> => {
    try {
      let result = await Whirlpool.getTx0Data(scode);
      result = JSON.parse(result);
      if (result.error) {
        console.log({ error: result.error });
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      logMessage(error);
      throw error;
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
  ): Promise<Preview> => {
    try {
      let result;
      if (Platform.OS === 'ios') {
        result = await Whirlpool.tx0Preview(
          `${inputsValue}`,
          JSON.stringify(pool),
          feeAddress || '',
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
          feeAddress || '',
          JSON.stringify(inputStructure),
          `${minerFeePerByte}`,
          `${coordinatorFee}`,
          nWantedMaxOutputsStr,
          `${nPoolMaxOutputs}`
        );
      }
      result = JSON.parse(result);
      if (result.error) {
        console.log({ error: result.error });
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      logMessage(error);
      throw error;
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
      let result = await Whirlpool.intoPsbt(
        JSON.stringify(preview),
        JSON.stringify(tx0Data),
        JSON.stringify(inputs),
        JSON.stringify(addressBank),
        changeAddress
      );
      result = JSON.parse(result);
      if (result.error) {
        console.log({ error: result.error });
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      logMessage(error);
      throw error;
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
      let result = await Whirlpool.tx0Push(txHex, poolId);
      result = JSON.parse(result);
      if (result.error) {
        console.log({ error: result.error });
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      logMessage(error);
      throw error;
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
      let result = await Whirlpool.blocking(
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
      result = JSON.parse(result);
      if (result.error) {
        console.log({ error: result.error });
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      logMessage(error);
      throw error;
    }
  };
}
