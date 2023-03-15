/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import { InputUTXOs } from 'src/core/wallets/interfaces';
import { Network, PoolData, Preview, TorConfig, TX0Data, WhirlpoolAPI } from './interface';
import { MOCK_POOL_DATA, MOCK_TX0_DATA } from './mock';
import { getAPIEndpoints } from './utils';

const LOCALHOST = '127.0.0.1';
export const TOR_CONFIG: TorConfig = {
  host: LOCALHOST,
  port: 9050,
  exit_into_clearnet: false,
  request_timeout: 120,
};

export default class WhirlpoolClient {
  static initiateAPI = (tor_config: TorConfig, network: Network): WhirlpoolAPI => {
    const agent = {};
    const endpoints = getAPIEndpoints(!tor_config.exit_into_clearnet, network === Network.Bitcoin);
    return { agent, endpoints };
  };

  static getPools = (api: WhirlpoolAPI): Array<PoolData> => MOCK_POOL_DATA;

  static getTx0Data = (api: WhirlpoolAPI, scode: string): Array<TX0Data> => MOCK_TX0_DATA;

  /**
   * Computes a TX0 preview containing output values that can be used to construct a real TX0.
   * If err, it means that the total value of inputs is insufficient to successully construct one.
   */
  static getTx0Preview = (
    tx0data: TX0Data,
    pool: PoolData,
    premix_fee_per_byte: number,
    miner_fee_per_byte: number,
    inputs: InputUTXOs[]
  ): Preview => {
    let inputs_value = 0;
    inputs.forEach((input) => {
      inputs_value += input.value;
    });

    if (inputs_value < pool.must_mix_balance_min)
      throw new Error(`You need ${pool.must_mix_balance_min} sats to do the mix`);

    // const preview = Preview::new(
    //     inputs_value: // construct from inputs,
    //     premix_value: // construct using PremixValue.new(pool: &Pool, fee_per_vbyte: f64),
    //     input_structure: &InputStructure,
    //     miner_fee: miner_fee_per_byte,
    //     coordinator_fee: tx0data.fee_value,
    //     n_wanted_max_outputs: Option<u16>,
    //     n_pool_max_outputs: u16
    //     )

    const minerFee = 256; // paying average tx fee for now(should be calculated using miner_fee_per_byte)
    const n_premix_outputs = Math.floor(
      (inputs_value - pool.fee_value - minerFee) / pool.must_mix_balance_min
    );
    const preview: Preview = {
      premix_value: pool.must_mix_balance_min, // low premix priority
      n_premix_outputs,
      coordinator_fee: pool.fee_value,
      miner_fee: minerFee,
      change:
        inputs_value - pool.fee_value - minerFee - n_premix_outputs * pool.must_mix_balance_min, // bad bank
    };

    return preview;
  };

  /**
   * Constructs Tx0 from Preview and returns the correspodning serializedPSBT for signing
   * Note: we are merging getTx0FromPreview w/ getTx0Preview as passing the preview struct from JS to Rust could be an issue
   */
  static getTx0FromPreview = (preview: Preview, tx0data: TX0Data, inputs: InputUTXOs): string => {
    // preview.into_psbt -> constructs the psbt and does the validation
    const serializedPSBT = '';
    return serializedPSBT;
  };
}
