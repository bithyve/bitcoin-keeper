import GasFree, {
  GasFreeProvider,
  GasFreeTransferRequest,
  GasFreeSignaturePayload,
  GasFreeTransferStatus,
  Permit712MessageTypes,
  Permit712MessageDomain,
} from './GasFree';
import { NetworkType } from 'src/services/wallets/enums';
import { isValidTronAddress, getTrc20Balance, getTrc20Transactions } from './Tron';
import { USDTWallet } from '../../factories/USDTWalletFactory';

// USDT Token addresses
const USDT_ADDRESSES = {
  [NetworkType.MAINNET]: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT TRC-20 on mainnet
  [NetworkType.TESTNET]: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf', // USDT TRC-20 on Nile testnet
};

export const DEFAULT_DEADLINE_SECONDS = 300; // Default deadline for permit transactions (5 minutes)

export interface USDTTransferOptions {
  source: USDTWallet;
  toAddress: string;
  amount: number;
  serviceProviderAddress?: string;
  maxFeeInUSDT?: number;
  deadlineInSeconds?: number;
  networkType?: NetworkType;
}

export interface USDTTransferResult {
  success: boolean;
  traceId?: string;
  transactionHash?: string;
  error?: string;
  transaction?: USDTTransaction;
}

export interface USDTAccountStatus {
  address: string;
  gasFreeAddress: string;
  isActive: boolean;
  frozen: number; // Frozen amount in pending transfers
  canTransfer: boolean;
  nextNonce: number;
  fees: {
    transferFee: number;
    activateFee: number;
  };
}

export interface USDTTransaction {
  txId?: string; // available post processing
  traceId?: string; // available via GasFree API
  from: string;
  to: string;
  amount: string;
  transferFee?: number; // Estimated transfer fee
  activateFee?: number; // Estimated activation fee
  fee?: string;
  status: GasFreeTransferStatus;
  timestamp: number;
  blockNumber?: number;
  isGasFree: boolean;
}

export default class USDT {
  /**
   * Get USDT token address for the specified network
   */
  private static getUSDTAddress(networkType?: NetworkType): string {
    const network = networkType || NetworkType.MAINNET;
    return USDT_ADDRESSES[network];
  }

  /**
   * Check if GasFree supports USDT transfers on the specified network
   */
  public static async isGasFreeSupported(networkType?: NetworkType): Promise<boolean> {
    try {
      const tokens = await GasFree.getSupportedTokens(networkType);
      const usdtAddress = USDT.getUSDTAddress(networkType);

      return tokens.some(
        (token) => token.tokenAddress.toLowerCase() === usdtAddress.toLowerCase() && token.supported
      );
    } catch (err) {
      throw new Error('Failed to check GasFree support for USDT on the specified network');
    }
  }

  /**
   * Get available service providers for USDT transfers
   */
  public static async getServiceProviders(networkType?: NetworkType): Promise<GasFreeProvider[]> {
    try {
      return await GasFree.getServiceProviders(networkType);
    } catch (err) {
      throw new Error('Failed to fetch service providers');
    }
  }

  /**
   * Get USDT account status and balance information
   */
  public static async getAccountStatus(
    address: string,
    networkType?: NetworkType
  ): Promise<USDTAccountStatus> {
    try {
      const accountInfo = await GasFree.getAccountInfo(address, networkType);
      const usdtAddress = USDT.getUSDTAddress(networkType);

      // Find USDT asset in account
      const usdtAsset = accountInfo.assets.find(
        (asset) => asset.tokenAddress.toLowerCase() === usdtAddress.toLowerCase()
      );

      if (!usdtAsset) throw new Error('USDT asset not found in account');
      const frozen = GasFree.parseTokenAmount(usdtAsset.frozen.toString(), usdtAsset.decimal);

      return {
        address: accountInfo.accountAddress,
        gasFreeAddress: accountInfo.gasFreeAddress,
        isActive: accountInfo.active,
        frozen,
        canTransfer: accountInfo.allowSubmit,
        nextNonce: accountInfo.nonce,
        fees: {
          transferFee: GasFree.parseTokenAmount(
            usdtAsset.transferFee.toString(),
            usdtAsset.decimal
          ),
          activateFee: GasFree.parseTokenAmount(
            usdtAsset.activateFee.toString(),
            usdtAsset.decimal
          ),
        },
      };
    } catch (err) {
      throw new Error('Failed to fetch account status');
    }
  }

  /**
   * Prepare USDT transfer parameters and validate
   */
  public static async prepareTransfer(options: USDTTransferOptions): Promise<{
    isValid: boolean;
    error?: string;
    signaturePayload?: {
      domain: Permit712MessageDomain;
      types: Permit712MessageTypes;
      message: GasFreeSignaturePayload;
    };
    fees?: {
      transferFee: number;
      activateFee: number;
      totalFee: number;
    };
  }> {
    try {
      const usdtAddress = USDT.getUSDTAddress(options.networkType);

      // Get service providers if not specified
      let serviceProviderAddress = options.serviceProviderAddress;
      if (!serviceProviderAddress) {
        const providers = await GasFree.getServiceProviders(options.networkType);
        if (providers.length === 0) {
          return { isValid: false, error: 'No service providers available' };
        }
        serviceProviderAddress = providers[0].address;
      }

      // Calculate fees
      const { source } = options;
      const fees = USDT.evaluateTransferFee(source.accountStatus);
      const maxFee = GasFree.formatTokenAmount(options.maxFeeInUSDT || fees.totalFee, 6);

      // Format amount to smallest unit
      const formattedAmount = GasFree.formatTokenAmount(options.amount, 6);

      // Check if account allows submission
      if (!source.accountStatus.canTransfer) {
        return {
          isValid: false,
          error: 'Account is not allowed to submit transfers at this time',
        };
      }

      // Generate signature payload
      const deadline = GasFree.calculateDeadline(
        options.deadlineInSeconds || DEFAULT_DEADLINE_SECONDS
      ); // Default to 5 minutes

      const transferData = {
        token: usdtAddress,
        serviceProvider: serviceProviderAddress,
        user: options.source.specs.address,
        receiver: options.toAddress,
        value: formattedAmount,
        maxFee,
        deadline,
        nonce: source.accountStatus.nextNonce,
      };

      const signaturePayload = GasFree.generateSignaturePayload(transferData, options.networkType);
      return {
        isValid: true,
        signaturePayload,
        fees: {
          transferFee: GasFree.parseTokenAmount(fees.transferFee.toString(), 6),
          activateFee: GasFree.parseTokenAmount(fees.activateFee.toString(), 6),
          totalFee: GasFree.parseTokenAmount(fees.totalFee.toString(), 6),
        },
      };
    } catch (err) {
      return { isValid: false, error: err.message || 'Failed to prepare transfer' };
    }
  }

  /**
   * Submit USDT transfer with signature
   */
  public static async submitTransfer(
    source: USDTWallet,
    signaturePayload: {
      domain: Permit712MessageDomain;
      types: Permit712MessageTypes;
      message: GasFreeSignaturePayload;
    }
  ): Promise<USDTTransferResult> {
    try {
      // Create and Sign transfer request
      const transferRequest: GasFreeTransferRequest = {
        ...signaturePayload.message,
        sig: await GasFree.signTransferPayload(
          source.specs.privateKey,
          signaturePayload,
          source.networkType
        ),
      };

      // Submit transfer
      const response = await GasFree.submitTransfer(transferRequest, source.networkType);
      const transferFee = GasFree.parseTokenAmount(response.estimatedTransferFee.toString(), 6);
      const activateFee = GasFree.parseTokenAmount(response.estimatedActivateFee.toString(), 6);
      const fee = transferFee + activateFee;
      const amount = GasFree.parseTokenAmount(response.amount.toString(), 6);
      const transaction: USDTTransaction = {
        traceId: response.id,
        from: transferRequest.user,
        to: transferRequest.receiver,
        amount: amount.toString(),
        transferFee: transferFee,
        activateFee: activateFee,
        fee: fee.toString(),
        status: response.state,
        timestamp: Date.now(),
        isGasFree: true,
      };

      return {
        success: true,
        traceId: response.id,
        transaction,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Failed to submit transfer',
      };
    }
  }

  /**
   * Track USDT transfer status
   */
  public static async getTransferStatus(
    traceId: string,
    networkType?: NetworkType
  ): Promise<{
    status: GasFreeTransferStatus;
    transactionHash?: string;
    amount?: number;
    fees?: {
      actualTransferFee?: number;
      actualActivateFee?: number;
      actualTotalFee?: number;
    };
    blockInfo?: {
      blockNumber?: number;
      blockTimestamp?: number;
    };
    error?: string;
  }> {
    try {
      const details = await GasFree.getTransferStatus(traceId, networkType);

      return {
        status: details.state,
        transactionHash: details.txnHash,
        amount: details.txnAmount ? GasFree.parseTokenAmount(details.txnAmount, 6) : undefined,
        fees: {
          actualTransferFee: details.txnTransferFee
            ? GasFree.parseTokenAmount(details.txnTransferFee.toString(), 6)
            : undefined,
          actualActivateFee: details.txnActivateFee
            ? GasFree.parseTokenAmount(details.txnActivateFee.toString(), 6)
            : undefined,
          actualTotalFee: details.txnTotalFee
            ? GasFree.parseTokenAmount(details.txnTotalFee.toString(), 6)
            : undefined,
        },
        blockInfo: {
          blockNumber: details.txnBlockNum,
          blockTimestamp: details.txnBlockTimestamp,
        },
      };
    } catch (err) {
      return {
        status: GasFreeTransferStatus.FAILED,
        error: err.message || 'Failed to fetch transfer status',
      };
    }
  }

  /**
   * Monitor USDT transfer until completion
   */
  public static async monitorTransfer(
    traceId: string,
    onStatusUpdate?: (status: any) => void,
    networkType?: NetworkType
  ): Promise<USDTTransferResult> {
    try {
      const pollIn = 15; // Poll every 15 seconds
      const maxAttempts = DEFAULT_DEADLINE_SECONDS / 15; // default deadline: 5 mins -- poll every 15 seconds, max attempts is 20

      const finalStatus = await GasFree.monitorTransfer(
        traceId,
        (details) => {
          if (onStatusUpdate) {
            onStatusUpdate({
              status: details.state,
              transactionHash: details.txnHash,
              amount: details.txnAmount
                ? GasFree.parseTokenAmount(details.txnAmount, 6)
                : undefined,
            });
          }
        },
        networkType,
        maxAttempts,
        pollIn * 1000 // Poll every 15 seconds, in milliseconds
      );

      if (finalStatus.state === GasFreeTransferStatus.SUCCEED) {
        return {
          success: true,
          traceId,
          transactionHash: finalStatus.txnHash,
        };
      } else {
        return {
          success: false,
          traceId,
          error: 'Transfer failed or was rejected',
        };
      }
    } catch (err) {
      return {
        success: false,
        traceId,
        error: err.message || 'Transfer monitoring failed',
      };
    }
  }

  /**
   * Evaluates transfer fees
   */
  public static evaluateTransferFee(accountStatus: USDTAccountStatus): {
    transferFee: number;
    activateFee: number;
    totalFee: number;
  } {
    try {
      const { activateFee, transferFee } = accountStatus.fees;
      const activationFee = accountStatus.isActive ? 0 : activateFee;
      const totalFee = activationFee + transferFee;
      return {
        transferFee: transferFee,
        activateFee: activationFee,
        totalFee: totalFee,
      };
    } catch (err) {
      throw new Error('Failed to estimate transfer fees');
    }
  }

  /**
   * Evaluates balance sufficiency
   */
  public static hasSufficientBalance(
    wallet: USDTWallet,
    toSend: number,
    fees: { transferFee: number; activateFee: number; totalFee: number }
  ) {
    const availableBalance = wallet.specs.balance - wallet.accountStatus.frozen;
    if (availableBalance < toSend + fees.totalFee) {
      return { availableBalance, hasSufficientBalance: false };
    }

    return { availableBalance, hasSufficientBalance: true };
  }

  /**
   * Validate address format using TronWeb
   */
  public static isValidAddress(address: string, networkType: NetworkType): boolean {
    return isValidTronAddress(address, networkType);
  }

  /**
   * Format USDT amount for display
   */
  public static formatUSDTAmount(amount: number, decimals: number = 2): string {
    return amount.toFixed(decimals);
  }

  /**
   * Parse USDT amount from string input
   */
  public static parseUSDTAmount(amountString: string): number {
    const parsed = parseFloat(amountString);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error('Invalid USDT amount');
    }
    return parsed;
  }

  /**
   * Get USDT balance directly from TRON blockchain
   */
  public static async getUSDTBalance(
    address: string,
    networkType: NetworkType = NetworkType.MAINNET
  ): Promise<number> {
    try {
      const usdtAddress = USDT.getUSDTAddress(networkType);
      const balanceResult = await getTrc20Balance(address, usdtAddress, networkType);
      return balanceResult.balance;
    } catch (error) {
      throw new Error('Failed to fetch USDT balance');
    }
  }

  /**
   * Get USDT transactions for a USDT wallet
   */
  public static async getUSDTTransactions(
    address: string,
    networkType: NetworkType,
    limit: number = 100,
    fingerprint?: string
  ): Promise<{
    transactions: USDTTransaction[];
    meta: {
      fingerprint: string;
      hasMore: boolean;
    };
  }> {
    // USDT contract addresses
    const USDT_CONTRACTS = {
      [NetworkType.MAINNET]: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      [NetworkType.TESTNET]: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
    };

    const usdtContract = USDT_CONTRACTS[networkType];
    const trc20Transactions = await getTrc20Transactions(
      address,
      usdtContract,
      networkType,
      limit,
      fingerprint
    );

    const updatedTransactions = trc20Transactions.transactions.map((txn) => ({
      txId: txn.transactionId,
      from: txn.from,
      to: txn.to,
      amount: txn.formattedValue.toString(),
      status: txn.confirmed ? GasFreeTransferStatus.SUCCEED : GasFreeTransferStatus.CONFIRMING,
      timestamp: txn.blockTimestamp,
      blockNumber: txn.blockNumber,
      isGasFree: txn.to === address ? false : true, // incoming transactions are not GasFree in the similar sense as outgoing
    }));

    return {
      transactions: updatedTransactions,
      meta: trc20Transactions.meta,
    };
  }
}
