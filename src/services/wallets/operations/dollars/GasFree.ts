import { AxiosResponse } from 'axios';
import { NetworkType } from 'src/services/wallets/enums';
import RestClient from '../../../rest/RestClient';
import { store } from 'src/store/store';
import * as crypto from 'crypto';

// GasFree API endpoints
const GASFREE_ENDPOINTS = {
  [NetworkType.MAINNET]: 'https://open.gasfree.io/tron/',
  [NetworkType.TESTNET]: 'https://open-test.gasfree.io/nile/',
};

// Network parameters for signature
const NETWORK_PARAMS = {
  [NetworkType.MAINNET]: {
    chainId: 728126428,
    verifyingContract: 'TFFAMQLZybALaLb4uxHA9RBE7pxhUAjF3U',
  },
  [NetworkType.TESTNET]: {
    chainId: 3448148188,
    verifyingContract: 'THQGuFzL87ZqhxkgqYEryRAd7gqFqL5rdc',
  },
};

// GasFree Interfaces
export interface GasFreeToken {
  tokenAddress: string;
  createdAt: string;
  updatedAt: string;
  activateFee: number;
  transferFee: number;
  supported: boolean;
  symbol: string;
  decimal: number;
}

export interface GasFreeProvider {
  address: string;
  name: string;
  icon: string;
  website: string;
  config: {
    maxPendingTransfer: number;
    minDeadlineDuration: number;
    maxDeadlineDuration: number;
    defaultDeadlineDuration: number;
  };
}

export interface GasFreeAccountInfo {
  accountAddress: string;
  gasFreeAddress: string;
  active: boolean;
  nonce: number;
  allowSubmit: boolean;
  assets: Array<{
    tokenAddress: string;
    tokenSymbol: string;
    activateFee: number;
    transferFee: number;
    decimal: number;
    frozen: number;
  }>;
}

export interface GasFreeTransferRequest {
  token: string;
  serviceProvider: string;
  user: string;
  receiver: string;
  value: string;
  maxFee: string;
  deadline: string;
  version: number;
  nonce: number;
  sig: string;
}

export interface GasFreeTransferResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  accountAddress: string;
  gasFreeAddress: string;
  providerAddress: string;
  targetAddress: string;
  tokenAddress: string;
  amount: string;
  maxFee: string;
  signature: string;
  version: number;
  nonce: number;
  expiredAt: string;
  state: 'WAITING' | 'INPROGRESS' | 'CONFIRMING' | 'SUCCEED' | 'FAILED';
  estimatedActivateFee: number;
  estimatedTransferFee: number;
}

export interface GasFreeTransferDetails extends GasFreeTransferResponse {
  estimatedTotalFee: number;
  estimatedTotalCost: number;
  txnHash?: string;
  txnBlockNum?: number;
  txnBlockTimestamp?: number;
  txnState?: 'INIT' | 'NOT_ON_CHAIN' | 'ON_CHAIN' | 'SOLIDITY' | 'ON_CHAIN_FAILED';
  txnActivateFee?: number;
  txnTransferFee?: number;
  txnTotalFee?: number;
  txnAmount?: string;
  txnTotalCost?: number;
}

export interface GasFreeSignaturePayload {
  token: string;
  serviceProvider: string;
  user: string;
  receiver: string;
  value: string;
  maxFee: string;
  deadline: string;
  version: number;
  nonce: number;
}

export interface GasFreeAPIResponse<T> {
  code: number;
  reason: string | null;
  message: string | null;
  data: T;
}

export interface GasFreeAPICredentials {
  apiKey: string;
  apiSecret: string;
}

export default class GasFree {
  private static credentials: GasFreeAPICredentials | null = null;
  /**
   * Set API credentials for authenticated requests
   */
  public static setCredentials(apiKey: string, apiSecret: string): void {
    GasFree.credentials = { apiKey, apiSecret };
  }

  /**
   * Get the appropriate endpoint URL based on network type
   */
  private static getEndpointURL(networkType?: NetworkType): string {
    const network = networkType || store.getState().settings.bitcoinNetworkType;
    return GASFREE_ENDPOINTS[network];
  }

  /**
   * Get network parameters for signing
   */
  private static getNetworkParams(networkType?: NetworkType) {
    const network = networkType || store.getState().settings.bitcoinNetworkType;
    return NETWORK_PARAMS[network];
  }

  /**
   * Extract network path from baseURL
   * e.g., 'https://open-test.gasfree.io/nile/' -> '/nile'
   * e.g., 'https://open.gasfree.io/tron/' -> '/tron'
   */
  private static extractNetworkPath(baseURL: string): string {
    try {
      const url = new URL(baseURL);
      const pathname = url.pathname;

      // Remove trailing slash: '/nile/' -> '/nile', '/tron/' -> '/tron'
      return pathname.replace(/\/$/, '');
    } catch (error) {
      return '';
    }
  }

  /**
   * Generate authentication headers for API requests
   */
  private static generateAuthHeaders(method: string, path: string): Record<string, string> {
    if (!GasFree.credentials) {
      throw new Error('GasFree API credentials not set. Call setCredentials() first.');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${method}${path}${timestamp}`;
    const signature = crypto
      .createHmac('sha256', GasFree.credentials.apiSecret)
      .update(message)
      .digest('base64');

    return {
      Timestamp: timestamp.toString(),
      Authorization: `ApiKey ${GasFree.credentials.apiKey}:${signature}`,
    };
  }

  /**
   * Make an authenticated API request
   */
  private static async makeAuthenticatedRequest<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: any,
    networkType?: NetworkType
  ): Promise<GasFreeAPIResponse<T>> {
    try {
      const baseURL = GasFree.getEndpointURL(networkType);
      const url = `${baseURL}${path}`;
      const networkPrefix = GasFree.extractNetworkPath(baseURL);
      const authHeaders = GasFree.generateAuthHeaders(method, networkPrefix + path);

      let response: AxiosResponse<any, any>;

      if (method === 'GET') {
        response = (await RestClient.get(url, {
          ...authHeaders,
        })) as AxiosResponse<any, any>;
      } else {
        response = (await RestClient.post(url, body, {
          ...authHeaders,
        })) as AxiosResponse<any, any>;
      }

      return response.data;
    } catch (err) {
      throw new Error(`GasFree API request failed: ${err.message || err}`);
    }
  }

  /**
   * Get all supported tokens
   */
  public static async getSupportedTokens(networkType?: NetworkType): Promise<GasFreeToken[]> {
    try {
      const response = await GasFree.makeAuthenticatedRequest<{ tokens: GasFreeToken[] }>(
        'GET',
        'api/v1/config/token/all',
        undefined,
        networkType
      );

      if (response.code !== 200) {
        throw new Error(response.message || 'Failed to fetch supported tokens');
      }

      return response.data.tokens;
    } catch (err) {
      throw new Error('Failed to fetch supported tokens');
    }
  }

  /**
   * Get all available service providers
   */
  public static async getServiceProviders(networkType?: NetworkType): Promise<GasFreeProvider[]> {
    try {
      const response = await GasFree.makeAuthenticatedRequest<{ providers: GasFreeProvider[] }>(
        'GET',
        'api/v1/config/provider/all',
        undefined,
        networkType
      );

      if (response.code !== 200) {
        throw new Error(response.message || 'Failed to fetch service providers');
      }

      return response.data.providers;
    } catch (err) {
      throw new Error('Failed to fetch service providers');
    }
  }

  /**
   * Get GasFree account information for a given address
   */
  public static async getAccountInfo(
    accountAddress: string,
    networkType?: NetworkType
  ): Promise<GasFreeAccountInfo> {
    try {
      const response = await GasFree.makeAuthenticatedRequest<GasFreeAccountInfo>(
        'GET',
        `api/v1/address/${accountAddress}`,
        undefined,
        networkType
      );

      if (response.code !== 200) {
        throw new Error(response.message || 'Failed to fetch account information');
      }

      return response.data;
    } catch (err) {
      throw new Error('Failed to fetch account information');
    }
  }

  /**
   * Generate signature payload for EIP-712 compatible signing
   */
  public static generateSignaturePayload(
    transferRequest: Omit<GasFreeSignaturePayload, 'version'>,
    networkType?: NetworkType
  ): {
    domain: any;
    types: any;
    message: GasFreeSignaturePayload;
  } {
    const params = GasFree.getNetworkParams(networkType);

    const domain = {
      name: 'GasFreeController',
      version: 'V1.0.0',
      chainId: params.chainId,
      verifyingContract: params.verifyingContract,
    };

    const types = {
      PermitTransfer: [
        { name: 'token', type: 'address' },
        { name: 'serviceProvider', type: 'address' },
        { name: 'user', type: 'address' },
        { name: 'receiver', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'maxFee', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'version', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
      ],
    };

    const message: GasFreeSignaturePayload = {
      ...transferRequest,
      version: 1,
    };

    return { domain, types, message };
  }

  /**
   * Submit a GasFree transfer authorization
   */
  public static async submitTransfer(
    transferRequest: GasFreeTransferRequest,
    networkType?: NetworkType
  ): Promise<GasFreeTransferResponse> {
    try {
      const response = await GasFree.makeAuthenticatedRequest<GasFreeTransferResponse>(
        'POST',
        'api/v1/gasfree/submit',
        transferRequest,
        networkType
      );

      if (response.code !== 200) {
        throw new Error(response.message || 'Failed to submit transfer');
      }

      return response.data;
    } catch (err) {
      // Handle specific error types from API
      if (err.response?.data?.reason) {
        const errorReasons = {
          ProviderAddressNotMatchException: 'Provider address does not match',
          DeadlineExceededException: 'Transfer authorization has expired',
          InvalidSignatureException: 'Invalid signature provided',
          UnsupportedTokenException: 'Token is not supported',
          TooManyPendingTransferException: 'Too many pending transfers',
          VersionNotSupportedException: 'Signature version not supported',
          NonceNotMatchException: 'Nonce does not match',
          MaxFeeExceededException: 'Estimated fee exceeds maximum limit',
          InsufficientBalanceException: 'Insufficient balance',
        };

        const errorMessage = errorReasons[err.response.data.reason] || err.response.data.message;
        throw new Error(errorMessage);
      }

      throw new Error('Failed to submit GasFree transfer');
    }
  }

  /**
   * Get transfer status by trace ID
   */
  public static async getTransferStatus(
    traceId: string,
    networkType?: NetworkType
  ): Promise<GasFreeTransferDetails> {
    try {
      const response = await GasFree.makeAuthenticatedRequest<GasFreeTransferDetails>(
        'GET',
        `api/v1/gasfree/${traceId}`,
        undefined,
        networkType
      );

      if (response.code !== 200) {
        throw new Error(response.message || 'Failed to fetch transfer status');
      }

      return response.data;
    } catch (err) {
      throw new Error('Failed to fetch transfer status');
    }
  }

  /**
   * Calculate deadline timestamp
   */
  public static calculateDeadline(durationInSeconds: number = 180): string {
    const deadline = Math.floor(Date.now() / 1000) + durationInSeconds;
    return deadline.toString();
  }

  /**
   * Validate transfer parameters before submission
   */
  public static validateTransferParams(
    accountInfo: GasFreeAccountInfo,
    tokenAddress: string,
    amount: string,
    maxFee: string
  ): { isValid: boolean; error?: string } {
    // Check if account allows submission
    if (!accountInfo.allowSubmit) {
      return {
        isValid: false,
        error: 'Account is not allowed to submit transfers at this time',
      };
    }

    // Find token in account assets
    const tokenAsset = accountInfo.assets.find(
      (asset) => asset.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
    );

    if (!tokenAsset) {
      return {
        isValid: false,
        error: 'Token not found in account assets',
      };
    }

    // Check if account is active or if activation fee is covered
    const totalCost = parseInt(amount) + parseInt(maxFee);
    const availableBalance = tokenAsset.frozen; // This should be the available balance minus frozen

    if (!accountInfo.active) {
      const totalWithActivation = totalCost + tokenAsset.activateFee;
      if (availableBalance < totalWithActivation) {
        return {
          isValid: false,
          error: 'Insufficient balance including activation fee',
        };
      }
    } else if (availableBalance < totalCost) {
      return {
        isValid: false,
        error: 'Insufficient balance for transfer',
      };
    }

    return { isValid: true };
  }

  /**
   * Format token amount to smallest unit (e.g., USDT to 6 decimal places)
   */
  public static formatTokenAmount(amount: number, decimals: number): string {
    return Math.floor(amount * Math.pow(10, decimals)).toString();
  }

  /**
   * Parse token amount from smallest unit to readable format
   */
  public static parseTokenAmount(amount: string, decimals: number): number {
    return parseInt(amount) / Math.pow(10, decimals);
  }

  /**
   * Get recommended fee for a token transfer
   */
  public static getRecommendedFee(
    accountInfo: GasFreeAccountInfo,
    tokenAddress: string
  ): { transferFee: number; activateFee: number; totalFee: number } {
    const tokenAsset = accountInfo.assets.find(
      (asset) => asset.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
    );

    if (!tokenAsset) {
      throw new Error('Token not found in account assets');
    }

    const transferFee = tokenAsset.transferFee;
    const activateFee = accountInfo.active ? 0 : tokenAsset.activateFee;
    const totalFee = transferFee + activateFee;

    return { transferFee, activateFee, totalFee };
  }

  /**
   * Monitor transfer until completion or failure
   */
  public static async monitorTransfer(
    traceId: string,
    onStatusUpdate?: (status: GasFreeTransferDetails) => void,
    networkType?: NetworkType,
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<GasFreeTransferDetails> {
    let attempts = 0;

    const poll = async (): Promise<GasFreeTransferDetails> => {
      try {
        const status = await GasFree.getTransferStatus(traceId, networkType);

        if (onStatusUpdate) {
          onStatusUpdate(status);
        }

        // Check if final state
        if (status.state === 'SUCCEED' || status.state === 'FAILED') {
          return status;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Transfer monitoring timeout');
        }

        // Wait and poll again
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        return poll();
      } catch (err) {
        throw err;
      }
    };

    return poll();
  }
}
