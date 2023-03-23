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
