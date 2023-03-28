/* eslint-disable no-plusplus */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import * as bitcoinJS from 'bitcoinjs-lib';
import WalletOperations from 'src/core/wallets/operations';
import ElectrumClient from 'src/core/services/electrum/client';
import { InputUTXOs, OutputUTXOs } from 'src/core/wallets/interfaces';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletUtilities from 'src/core/wallets/operations/utils';
import {
  Info,
  InputStructure,
  Network,
  PoolData,
  Preview,
  Step,
  TorConfig,
  TX0Data,
  WhirlpoolAPI,
} from './interface';
import { MOCK_POOL_DATA, MOCK_TX0_DATA } from './mock';
import { generateMockTransaction, getAPIEndpoints, sleep } from './utils';

const LOCALHOST = '127.0.0.1';
export const TOR_CONFIG: TorConfig = {
  host: LOCALHOST,
  port: 9050,
  exit_into_clearnet: false,
  request_timeout: 120,
};

export default class WhirlpoolClient {
  /**
   * Creates a new API instance with its own isolation tokens.
   * Returns `None` if Tor is not locally running and available.
   * @param  {TorConfig} tor_config
   * @param  {Network} network
   * @returns WhirlpoolAPI
   */
  static initiateAPI = (tor_config: TorConfig, network: Network): WhirlpoolAPI => {
    const agent = {};
    const endpoints = getAPIEndpoints(!tor_config.exit_into_clearnet, network === Network.Bitcoin);
    return { agent, endpoints };
  };

  /**
   * whirlpool mixing pools provider: fetches pool info from the coordinator
   * @param  {WhirlpoolAPI} api
   * @returns Promise<PoolData[]>
   */
  static getPools = async (api: WhirlpoolAPI): Promise<PoolData[]> => MOCK_POOL_DATA;

  /**
   * Fetches TX0 data from the coordinator. Needed to craft a TX0
   * @param  {WhirlpoolAPI} api
   * @param  {string} scode?
   * @returns Promise<Tx0Data[]>
   */
  static getTx0Data = async (api: WhirlpoolAPI, scode?: string): Promise<TX0Data[]> =>
    MOCK_TX0_DATA;

  /**
   * Computes a TX0 preview containing output values that can be used to construct a real TX0.
   * If err, it means that the total value of inputs is insufficient to successully construct one.
   * @param  {TX0Data} tx0data
   * @param  {PoolData} pool
   * @param  {number} premix_fee_per_byte
   * @param  {number} miner_fee_per_byte
   * @param  {InputUTXOs[]} inputs
   * @returns Preview
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

    // const input_structure: InputStructure = { // TODO: generate based on UTXO type
    //   n_p2pkh_inputs: 0,
    //   n_p2sh_p2wpkh_inputs: 0,
    //   n_p2wpkh_inputs: inputs.length,
    // };

    // console.log({
    //   inputs_value,
    //   pool, // to construct premix_value using PremixValue::new
    //   premix_fee_per_byte, // to construct premix_value using PremixValue::new,
    //   input_structure,
    //   miner_fee_per_byte,
    //   coordinator_fee: tx0data.fee_value,
    //   n_wanted_max_outputs: null,
    //   n_pool_max_outputs: pool.tx0_max_outputs,
    // });

    const minerFee = 1000; // paying average tx fee for now(should be calculated using miner_fee_per_byte)
    const n_premix_outputs = Math.floor(
      (inputs_value - pool.fee_value - minerFee) / pool.must_mix_balance_min
    );
    const preview: Preview = {
      premix_value: pool.must_mix_balance_min, // low premix priority
      n_premix_outputs,
      coordinator_fee: tx0data.fee_value,
      miner_fee: minerFee,
      change:
        inputs_value - pool.fee_value - minerFee - n_premix_outputs * pool.must_mix_balance_min, // bad bank
    };

    return preview;
  };

  /**
   * Constructs Tx0 from Preview and returns the correspodning serializedPSBT for signing
   * Note: we are merging getTx0FromPreview w/ getTx0Preview as passing the preview struct from JS to Rust could be an issue
   * @param  {Preview} preview
   * @param  {TX0Data} tx0data
   * @param  {InputUTXOs[]} inputs
   * @param  {{premix:string[];badbank:string;}} outputProvider
   * @param  {Wallet} deposit
   * @returns bitcoinJS.Psbt
   */
  static getTx0FromPreview = (
    preview: Preview,
    tx0data: TX0Data,
    inputs: InputUTXOs[],
    outputProvider: {
      // for mock only(output provider for rust-client works differently)
      premix: string[]; // count: preview.n_premix_outputs
      badbank: string;
    },
    deposit: Wallet // for mock only(not required for the rust client)
  ): bitcoinJS.Psbt => {
    // preview.into_psbt -> constructs the psbt and does the validation

    if (outputProvider.premix.length !== preview.n_premix_outputs)
      throw new Error(`Please supply enough(${preview.n_premix_outputs}) premix addresses`);

    const PSBT = generateMockTransaction(inputs, preview, tx0data, deposit, outputProvider);
    return PSBT;
  };

  /**
   * signs tx0
   * @param  {Wallet} deposit
   * @param  {InputUTXOs[]} inputs
   * @param  {bitcoinJS.Psbt} PSBT
   * @returns bitcoinJS.Transaction
   */
  static signTx0 = (
    deposit: Wallet,
    inputs: InputUTXOs[],
    PSBT: bitcoinJS.Psbt
  ): bitcoinJS.Transaction => {
    const { signedPSBT } = WalletOperations.signTransaction(deposit, inputs, PSBT);
    return signedPSBT.finalizeAllInputs().extractTransaction();
  };

  /**
   * broadcasts tx0
   * @param  {bitcoinJS.Transaction} tx0
   * @param  {string} pool_id
   * @returns {Promise} txid
   */
  static broadcastTx0 = async (tx0: bitcoinJS.Transaction, pool_id: string): Promise<string> => {
    const txHex = tx0.toHex();
    const txid = await ElectrumClient.broadcast(txHex);
    return txid;
  };

  /**
   * mixing mock: whirlpooling from premix to postmix
   * @param  {Wallet} premix
   * @param  {Wallet} postmix
   * @param  {PoolData} pool
   * @returns {Promise} txid
   */
  static premixToPostmix = async (
    premixInput: InputUTXOs,
    destinationAddress: string,
    denomination: number,
    premix: Wallet,
    notify: Function
  ): Promise<string> => {
    if (!premixInput && !premixInput.height) throw new Error('Premix input is not confirmed');

    await sleep();
    notify(Info.Working, Step.WaitingForCoordinator);

    await sleep();
    notify(Info.Working, Step.Connecting);

    const network = WalletUtilities.getNetworkByType(premix.networkType);
    const postMixOutput: OutputUTXOs = {
      address: destinationAddress,
      value: denomination,
    };

    await sleep();
    notify(Info.Working, Step.Subscribing);

    const PSBT: bitcoinJS.Psbt = new bitcoinJS.Psbt({
      network,
    });

    await sleep();
    notify(Info.Working, Step.RegisteringInput);

    await sleep();
    notify(Info.Working, Step.ConfirmingInput);
    WalletOperations.addInputToPSBT(PSBT, premix, premixInput, network);

    await sleep();
    notify(Info.Working, Step.RegisteringOutput);
    PSBT.addOutput(postMixOutput);

    await sleep();
    notify(Info.Working, Step.Signing);
    const { signedPSBT } = WalletOperations.signTransaction(premix, [premixInput], PSBT);

    const txHex = signedPSBT.finalizeAllInputs().extractTransaction().toHex();
    const txid = await ElectrumClient.broadcast(txHex);
    notify(Info.Success);
    return txid;
  };
}
