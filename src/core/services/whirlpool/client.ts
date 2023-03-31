/* eslint-disable no-plusplus */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import * as bitcoinJS from 'bitcoinjs-lib';
import WalletOperations from 'src/core/wallets/operations';
import ElectrumClient from 'src/core/services/electrum/client';
import { InputUTXOs, OutputUTXOs } from 'src/core/wallets/interfaces';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletUtilities from 'src/core/wallets/operations/utils';
import WhirlpoolServices from 'src/nativemodules/WhirlpoolServices';
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
} from '../../../nativemodules/interface';
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
   * @returns Promise<PoolData[]>
   */
  static getPools = async (): Promise<PoolData[]> => WhirlpoolServices.getPools();

  /**
   * Fetches TX0 data from the coordinator. Needed to craft a TX0
   * @param  {string} scode?
   * @returns Promise<Tx0Data[]>
   */
  static getTx0Data = async (scode?: string): Promise<TX0Data[]> => WhirlpoolServices.getTx0Data();

  /**
   * Computes a TX0 preview containing output values that can be used to construct a real TX0.
   * If err, it means that the total value of inputs is insufficient to successully construct one.
   * @param  {TX0Data} tx0data
   * @param  {PoolData} pool
   * @param  {number} premixFeePerByte
   * @param  {number} minerFeePerByte
   * @param  {InputUTXOs[]} inputs
   * @returns Preview
   */
  static getTx0Preview = async (
    tx0data: TX0Data,
    pool: PoolData,
    premixFeePerByte: number,
    minerFeePerByte: number,
    inputs: InputUTXOs[]
  ): Promise<Preview> => {
    let inputsValue = 0;
    inputs.forEach((input) => {
      inputsValue += input.value;
    });

    const inputStructure: InputStructure = {
      nbP2pkhInputs: 0,
      nbP2shP2wpkhInputs: 0,
      nbP2wpkhInputs: inputs.length,
    };

    return WhirlpoolServices.getTx0Preview(
      inputsValue,
      pool,
      premixFeePerByte,
      inputStructure,
      minerFeePerByte,
      tx0data.feeValue,
      null,
      pool.tx0MaxOutputs
    );
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
