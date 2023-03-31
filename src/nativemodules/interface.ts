/* eslint-disable no-unused-vars */

export enum Network {
  /// Classic Bitcoin
  Bitcoin = 'bitcoin',
  /// Bitcoin's testnet
  Testnet = 'testnet',
}

export enum MixStatus {
  ConfirmInput = 'ConfirmInput',
  RegisterOutput = 'RegisterOutput',
  RevealOutput = 'RevealOutput',
  Signing = 'Signing',
  Success = 'Success',
  Fail = 'Fail',
}

export enum Step {
  WaitingForCoordinator = 'WaitingForCoordinator',
  Connecting = 'Connecting',
  Subscribing = 'Subscribing',
  RegisteringInput = 'RegisteringInput',
  ConfirmingInput = 'ConfirmingInput',
  CheckingOutput = 'CheckingOutput',
  RegisteringOutput = 'RegisteringOutput',
  Signing = 'Signing',
  RevealingOutput = 'RevealingOutput',
}

export enum Info {
  Working = 'Working',
  Success = 'Success',
  Failure = 'Failure',
  Error = 'Error',
}

export interface TorConfig {
  host: string;
  port: number;
  exit_into_clearnet: boolean;
  request_timeout: number;
}

export interface WhirlpoolAPI {
  agent: any;
  endpoints: any;
}

export interface PoolData {
  id: string;
  denomination: number;
  feeValue: number;
  mustMixBalanceMin: number;
  mustMixBalanceCap: number;
  minAnonymitySet: number;
  minMustMix: number;
  tx0MaxOutputs: number;
  nbRegistered: number;
  mixStatus: MixStatus;
  elapsedTime: number;
  nbConfirmed: number;
}

export interface TX0Data {
  poolId: string;
  feePaymentCode: string;
  feeValue: number;
  feeChange: number;
  feeDiscountPercent: number;
  message: string;
  feePayload64: string;
  feeAddress: string;
  feeOutputSignature: string;
}

export interface Preview {
  premixValue: number;
  nPremixOutputs: number;
  minerFee: number;
  coordinatorFee: {
    coordinator?: Array<any>; // value: number; address: string
    depositBack?: number;
  };
  change: number;
}

/// Used during TX0 fee computation. Needed because different script types have different lengths.
export interface InputStructure {
  nbP2pkhInputs: number;
  nbP2shP2wpkhInputs: number;
  nbP2wpkhInputs: number;
}

export interface BitcoinRustInput {
  /// Outpoint used by this input.
  outpoint: {
    /// The referenced transaction's txid.
    txid: string;
    /// The index of the referenced output in its transaction's vout.
    vout: number;
  };
  /// Previous txout used by this input.
  prev_txout: {
    /// The value of the output, in satoshis.
    value: number;
    /// The script which must be satisfied for the output to be spent.
    script_pubkey: string;
  };
  /// Arbitrary per-input PSBT fields for use by the signer.
  fields: {};
}

export interface OutputTemplate {
  /// Address that this output is sending to.
  address: string;
  /// Arbitrary per-output PSBT fields for use by the signer.
  fields: {};
}
