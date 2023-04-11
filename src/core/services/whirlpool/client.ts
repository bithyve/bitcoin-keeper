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
import { NetworkType } from 'src/core/wallets/enums';
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
  WhirlpoolInput,
} from '../../../nativemodules/interface';
import { getAPIEndpoints, sleep } from './utils';
import { hash256 } from '../operations/encryption';

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
      nP2pkhInputs: 0,
      nP2shP2wpkhInputs: 0,
      nP2wpkhInputs: inputs.length,
    };

    return WhirlpoolServices.getTx0Preview(
      inputsValue,
      pool,
      tx0data.feeAddress,
      inputStructure,
      minerFeePerByte,
      tx0data.feeValue,
      '',
      pool.tx0MaxOutputs,
      premixFeePerByte
    );
  };

  /**
   * Constructs Tx0 from Preview and returns the correspodning serializedPSBT for signing
   * @param  {Preview} preview
   * @param  {TX0Data} tx0data
   * @param  {InputUTXOs[]} inputs
   * @param  {{premix:string[];badbank:string;}} outputProvider
   * @returns serializedPSBT(base64) bitcoinJS.Psbt
   */
  static getTx0FromPreview = async (
    preview: Preview,
    tx0data: TX0Data,
    inputs: InputUTXOs[],
    outputProvider: {
      premix: string[];
      badbank: string;
    },
    network: bitcoinJS.Network
  ): Promise<{ serializedPSBT: string }> => {
    if (outputProvider.premix.length !== preview.nPremixOutputs)
      throw new Error(`Please supply enough(${preview.nPremixOutputs}) premix addresses`);

    const whirlpoolInputs: WhirlpoolInput[] = inputs.map((input) => {
      const rustInput: WhirlpoolInput = {
        outpoint: {
          txid: input.txId,
          vout: input.vout,
        },
        prev_txout: {
          value: input.value,
          script_pubkey: bitcoinJS.address.toOutputScript(input.address, network).toString('hex'),
        },
        fields: {},
      };
      return rustInput;
    });

    const serializedPSBT = await WhirlpoolServices.previewToPSBT(
      preview,
      tx0data,
      whirlpoolInputs,
      outputProvider.premix,
      outputProvider.badbank
    );

    return { serializedPSBT };
  };

  /**
   * signs tx0
   * @param  {string} serializedPSBT(base64)
   * @param  {Wallet} deposit
   * @returns bitcoinJS.Transaction
   */
  static signTx0 = (
    serializedPSBT: string,
    deposit: Wallet,
    inputUTXOs: InputUTXOs[]
  ): { txHex: string; PSBT: bitcoinJS.Psbt } => {
    const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT, {
      network: WalletUtilities.getNetworkByType(deposit.networkType),
    });

    const reconstructedInputsToSign: InputUTXOs[] = [];
    for (const input of PSBT.txInputs) {
      const txId = input.hash.toString('hex').match(/.{2}/g).reverse().join('');
      reconstructedInputsToSign.push(...inputUTXOs.filter((input) => input.txId === txId));
    }

    const { signedPSBT } = WalletOperations.signTransaction(
      deposit,
      reconstructedInputsToSign,
      PSBT
    );
    return { txHex: signedPSBT.finalizeAllInputs().extractTransaction().toHex(), PSBT: signedPSBT };
  };

  /**
   * broadcasts tx0
   * @param  {string} tx0Hex
   * @param  {string} pool_id
   * @returns {Promise} txid
   */
  static broadcastTx0 = async (tx0Hex: string, poolId: string): Promise<string> =>
    WhirlpoolServices.tx0Push(tx0Hex, poolId);

  /**
   * starts a new whirlpool mix
   * @param  {InputUTXOs} input
   * @param  {Wallet} premix
   * @param  {Wallet} postmix
   * @param  {PoolData} pool
   * @param  {number} blockHeight
   * @returns {Promise<string>} txid
   */
  static startMix = async (
    input: InputUTXOs,
    premix: Wallet,
    postmix: Wallet,
    pool: PoolData,
    blockHeight: number
  ): Promise<string> => {
    if (!input && !input.height) throw new Error('Input is not confirmed');

    const network = WalletUtilities.getNetworkByType(premix.networkType);
    const rustInput: WhirlpoolInput = {
      outpoint: {
        txid: input.txId,
        vout: input.vout,
      },
      prev_txout: {
        value: input.value,
        script_pubkey: bitcoinJS.address.toOutputScript(input.address, network).toString('hex'),
      },
      fields: {},
    };

    const { privateKey } = WalletUtilities.addressToKey(input.address, premix) as {
      privateKey: string;
      subPath: number[];
    };
    const destination = postmix.specs.receivingAddress;
    const preUserHash = hash256(premix.derivationDetails.mnemonic);
    const networkType: Network =
      premix.networkType === NetworkType.TESTNET ? Network.Testnet : Network.Bitcoin;
    const signedRegistrationMessage = WalletUtilities.signBitcoinMessage(
      pool.poolId,
      privateKey,
      network
    );

    return WhirlpoolServices.startMix(
      rustInput,
      privateKey,
      destination,
      pool.poolId,
      pool.denomination.toString(),
      preUserHash,
      networkType,
      blockHeight.toString(),
      signedRegistrationMessage
    );
  };
}
