import { AxiosResponse } from 'axios';
import { NetworkType } from 'src/services/wallets/enums';
import RestClient from '../../../rest/RestClient';
import * as crypto from 'crypto';
import config from '../../../../utils/service-utilities/config';
import { createTronWeb } from './Tron';
import idx from 'idx';

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

export enum GasFreeTransferStatus {
  WAITING = 'WAITING',
  INPROGRESS = 'INPROGRESS',
  CONFIRMING = 'CONFIRMING',
  SUCCEED = 'SUCCEED',
  FAILED = 'FAILED',
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
  state: GasFreeTransferStatus;
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

// TIP-712 Signing Types for GasFree
export interface TIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface TIP712TypeProperty {
  name: string;
  type: string;
}

export interface TIP712MessageTypes {
  PermitTransfer: TIP712TypeProperty[];
}

export interface Permit712MessageDomain extends TIP712Domain {
  name: 'GasFreeController';
  version: 'V1.0.0';
  chainId: number; // Network specific chain ID in decimal
  verifyingContract: string; // GasFreeController contract address
}

export interface Permit712MessageTypes extends TIP712MessageTypes {
  PermitTransfer: [
    { name: 'token'; type: 'address' },
    { name: 'serviceProvider'; type: 'address' },
    { name: 'user'; type: 'address' },
    { name: 'receiver'; type: 'address' },
    { name: 'value'; type: 'uint256' },
    { name: 'maxFee'; type: 'uint256' },
    { name: 'deadline'; type: 'uint256' },
    { name: 'version'; type: 'uint256' },
    { name: 'nonce'; type: 'uint256' }
  ];
}

export default class GasFree {
  private static credentials: GasFreeAPICredentials = {
    // Mainnet ONLY – Testnet access is not available to end users
    apiKey: config.GASFREE_API_KEY,
    apiSecret: config.GASFREE_API_SECRET,
  };

  // TIP-712 Constants
  private static readonly TIP712_MESSAGE_TYPES: Permit712MessageTypes = {
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

  // Fixed values as per GasFree documentation
  private static readonly TIP712_DOMAIN_NAME = 'GasFreeController';
  private static readonly TIP712_DOMAIN_VERSION = 'V1.0.0';
  private static readonly SIGNATURE_VERSION = 1;

  /**
   * Get the appropriate endpoint URL based on network type
   */
  private static getEndpointURL(networkType?: NetworkType): string {
    const network = networkType || NetworkType.MAINNET;
    return GASFREE_ENDPOINTS[network];
  }

  /**
   * Get network parameters for signing
   */
  private static getNetworkParams(networkType?: NetworkType) {
    const network = networkType || NetworkType.MAINNET;
    return NETWORK_PARAMS[network];
  }

  /**
   * Extract network path from baseURL
   * e.g., 'https://open-test.gasfree.io/nile/' -> '/nile/'
   * e.g., 'https://open.gasfree.io/tron/' -> '/tron/'
   */
  private static extractNetworkPath(baseURL: string): string {
    try {
      // Remove protocol and domain: 'https://open-test.gasfree.io/nile/' -> '/nile/'
      const pathStartIndex = baseURL.indexOf('/', baseURL.indexOf('://') + 3);
      if (pathStartIndex === -1) return '';

      let pathname = baseURL.substring(pathStartIndex);
      return pathname;
    } catch (error) {
      throw new Error('Error extracting network path: ' + error?.message);
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
      const errorMessage = idx(err, (_) => _.response.data);
      throw new Error(`GasFree API request failed: ${errorMessage || err.message || err}`);
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
      throw new Error(`Failed to fetch supported tokens: ${err.message || err}`);
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
      throw new Error(`Failed to fetch service providers: ${err.message || err}`);
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
      throw new Error(`Failed to fetch account info: ${err.message || err}`);
    }
  }

  /**
   * Generate signature payload for TIP-712 compatible signing
   */
  public static generateSignaturePayload(
    transferRequest: Omit<GasFreeSignaturePayload, 'version'>,
    networkType?: NetworkType
  ): {
    domain: Permit712MessageDomain;
    types: Permit712MessageTypes;
    message: GasFreeSignaturePayload;
  } {
    const params = GasFree.getNetworkParams(networkType);

    const domain: Permit712MessageDomain = {
      name: GasFree.TIP712_DOMAIN_NAME,
      version: GasFree.TIP712_DOMAIN_VERSION,
      chainId: params.chainId,
      verifyingContract: params.verifyingContract,
    };

    const types: Permit712MessageTypes = GasFree.TIP712_MESSAGE_TYPES;

    const message: GasFreeSignaturePayload = {
      ...transferRequest,
      version: GasFree.SIGNATURE_VERSION,
    };

    return { domain, types, message };
  }

  /**
   * Sign GasFree transfer payload using TIP-712 standard
   * @param privateKey - Private key in hex format for signing
   * @param signaturePayload - Signature payload containing domain, types, and message
   * @param networkType - Network type (mainnet/testnet)
   * @returns Promise<string> - Signature without 0x prefix
   */
  public static async signTransferPayload(
    privateKey: string,
    signaturePayload: {
      domain: Permit712MessageDomain;
      types: Permit712MessageTypes;
      message: GasFreeSignaturePayload;
    },
    networkType: NetworkType
  ): Promise<string> {
    try {
      const tronWeb = createTronWeb(networkType);
      tronWeb.setPrivateKey(privateKey);

      // Sign using TronWeb's TIP-712 implementation
      const { domain, types, message } = signaturePayload;
      const signature = await tronWeb.trx._signTypedData(domain, types, message);

      // Remove 0x prefix if present (as per GasFree documentation)
      const cleanSignature = signature.startsWith('0x') ? signature.slice(2) : signature;
      return cleanSignature;
    } catch (error) {
      throw new Error(`Failed to sign transfer payload: ${error.message}`);
    }
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
      throw new Error(`Failed to submit transfer: ${err.message || err}`);
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
      throw new Error(`Failed to fetch transfer status: ${err.message || err}`);
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
   * Format token amount to smallest unit (e.g., USDT to 6 decimal places)
   */
  public static formatTokenAmount(amount: number, decimals: number): string {
    return Math.ceil(amount * Math.pow(10, decimals)).toString();
  }

  /**
   * Parse token amount from smallest unit to readable format
   */
  public static parseTokenAmount(amount: string, decimals: number): number {
    return parseInt(amount) / Math.pow(10, decimals);
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
