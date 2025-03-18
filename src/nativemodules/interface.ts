export enum Network {
  /// Classic Bitcoin
  Bitcoin = 'bitcoin',
  /// Bitcoin's testnet
  Testnet = 'testnet',
}

export interface TorConfig {
  host: string;
  port: number;
  exit_into_clearnet: boolean;
  request_timeout: number;
}

export interface HistoricalInisightData {
  avgHeight: number;
  timestamp: number;
  avgFee_0: number;
  avgFee_10: number;
  avgFee_25: number;
  avgFee_50: number;
  avgFee_75: number;
  avgFee_90: number;
  avgFee_100: number;
}
