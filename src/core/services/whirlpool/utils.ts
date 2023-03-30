/* eslint-disable no-promise-executor-return */
/* eslint-disable no-plusplus */
import * as bitcoinJS from 'bitcoinjs-lib';
import { OutputUTXOs } from 'src/core/wallets/interfaces';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletOperations from 'src/core/wallets/operations';
import { Preview, TX0Data } from './interface';

export const baseServer = (onion: boolean, mainnet: boolean) => {
  if (onion) {
    if (mainnet) return 'udkmfc5j6zvv3ysavbrwzhwji4hpyfe3apqa6yst7c7l32mygf65g4ad.onion:80';
    return 'y5qvjlxvbohc73slq4j4qldoegyukvpp74mbsrjosnrsgg7w5fon6nyd.onion:80';
  }
  if (mainnet) return 'pool.whirl.mx:8080';
  return 'pool.whirl.mx:8081';
};

export const getAPIEndpoints = (onion: boolean, mainnet: boolean) => {
  const server = baseServer(onion, mainnet);

  return {
    server,
    ws_connect: `ws://${server}/ws/connect`,
    check_output: `http://${server}/rest/checkOutput`,
    register_output: `http://${server}/rest/registerOutput`,
    pools: `http://${server}/rest/pools`,
    tx0_data: `http://${server}/rest/tx0/v1`,
    tx0_push: `http://${server}/rest/tx0/push`,
  };
};

export const generateMockTransaction = (
  inputs,
  preview: Preview,
  tx0data: TX0Data,
  deposit: Wallet,
  outputProvider: {
    premix: string[];
    badbank: string;
  },
  network = bitcoinJS.networks.testnet
): bitcoinJS.Psbt => {
  const PSBT: bitcoinJS.Psbt = new bitcoinJS.Psbt({
    network,
  });

  const outputUTXOs: OutputUTXOs[] = [];
  // register premix outputs
  for (let i = 0; i < preview.n_premix_outputs; i++) {
    outputUTXOs.push({
      address: outputProvider.premix[i],
      value: preview.premix_value,
    });
  }

  // register whirlpool fee output
  outputUTXOs.push({
    address: tx0data.feeAddress,
    value: tx0data.feeValue,
  });

  // TODO: OP_RETURN for the fee payload

  // register bad bank output
  outputUTXOs.push({
    address: outputProvider.badbank,
    value: preview.change,
  });

  for (const input of inputs) WalletOperations.addInputToPSBT(PSBT, deposit, input, network);
  for (const output of outputUTXOs) {
    if (output.address && output.value) PSBT.addOutput(output);
  }

  return PSBT;
};

export function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
