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
  fee_value: number;
  must_mix_balance_min: number;
  must_mix_balance_cap: number;
  min_anonymity_set: number;
  min_must_mix: number;
  tx0_max_outputs: number;
  n_registered: number;
  mix_status: MixStatus;
  elapsed_time: number;
  n_confirmed: number;
}

export interface TX0Data {
  pool_id: string;
  fee_payment_code: string;
  fee_value: number;
  fee_change: number;
  fee_discount_percent: number;
  message: string;
  fee_payload_64: string;
  fee_address: string;
  fee_output_signature: string;
}

export interface Preview {
  premix_value: number;
  n_premix_outputs: number;
  miner_fee: number;
  coordinator_fee: number;
  change: number;
}

/// Used during TX0 fee computation. Needed because different script types have different lengths.
export interface InputStructure {
  n_p2pkh_inputs: number;
  n_p2sh_p2wpkh_inputs: number;
  n_p2wpkh_inputs: number;
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
