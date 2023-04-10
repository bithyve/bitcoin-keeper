import { NativeModules, Platform } from 'react-native';
import { WhirlpoolInput, InputStructure, PoolData, Preview, TX0Data } from './interface';

const { Whirlpool } = NativeModules;

export default class WhirlpoolServices {
  /**
   * whirlpool mixing pools provider: fetches pool info from the coordinator
   * @returns {Promise<PoolData[]>} PoolData[]
   */
  static getPools = async (): Promise<PoolData[]> => {
    try {
      const result = await Whirlpool.getPools();
      if (!result) throw new Error('Failed to fetch pools data');

      return JSON.parse(result);
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  };

  /**
   * Fetches TX0 data from the coordinator.
   * @returns {Promise<Tx0Data[]>} Tx0Data[]
   */
  static getTx0Data = async (): Promise<TX0Data[]> => {
    try {
      const result = await Whirlpool.getTx0Data();
      if (!result) throw new Error('Failed to fetch tx0 data');

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
      let result
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
          inputsValue,
          JSON.stringify(pool),
          `${premixFeePerByte}`,
          feeAddress,
          JSON.stringify(inputStructure),
          `${minerFeePerByte}`,
          `${coordinatorFee}`,
          nWantedMaxOutputsStr,
          `${nPoolMaxOutputs}`,
        )
      }

      if (!result) throw new Error('Failed to generate tx0 preview');
      if (result === 'No enough sats for mixing.') {
        return result;
      }
      return JSON.parse(result);
    } catch (error) {
      console.log({ error });
      throw new Error(error);
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
  ): Promise<string> => {
    try {
      const result = await Whirlpool.intoPsbt(
        JSON.stringify(preview),
        JSON.stringify(tx0Data),
        JSON.stringify(inputs),
        JSON.stringify(addressBank),
        changeAddress
      );
      if (!result) throw new Error('Failed to construct PSBT from Tx0 Preview');
      return result;
    } catch (error) {
      console.log({ error });
      throw new Error(error);
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
      const result = await Whirlpool.tx0push(txHex, poolId);
      if (!result) throw new Error('Failed to broadcast tx0');
      return result;
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  };

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
  };
}
