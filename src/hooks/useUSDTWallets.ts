import { useState, useEffect, useCallback } from 'react';
import {
  generateUSDTWallet,
  syncUSDTWalletBalance,
  updateUSDTWalletAccountStatus,
  updateUSDTWalletBalanceTxs,
  USDTWallet,
  USDTWalletType,
  getAvailableBalanceUSDTWallet,
} from '../services/wallets/factories/USDTWalletFactory';
import { NetworkType, VisibilityType } from '../services/wallets/enums';
import dbManager from '../storage/realm/dbManager';
import { RealmSchema } from '../storage/realm/enum';
import { captureError } from '../services/sentry';
import USDT, {
  DEFAULT_DEADLINE_SECONDS,
  USDTTransferOptions,
} from '../services/wallets/operations/dollars/USDT';

export interface UseUSDTWalletsOptions {
  getAll?: boolean;
  networkType?: NetworkType;
  includeHidden?: boolean;
}

export interface UseUSDTWalletsReturn {
  usdtWallets: USDTWallet[];
  loading: boolean;
  error: string | null;
  createWallet: (params: {
    type: USDTWalletType;
    name: string;
    description: string;
    primaryMnemonic?: string;
    privateKey?: string; // Required for IMPORTED type
  }) => Promise<USDTWallet | null>;
  deleteWallet: (walletId: string) => Promise<boolean>;
  updateWallet: (wallet: USDTWallet) => Promise<boolean>;
  syncAccountStatus: (wallet: USDTWallet) => Promise<USDTWallet>;
  syncWalletBalance: (wallet: USDTWallet) => Promise<USDTWallet>;
  syncWallet: (wallet: USDTWallet) => Promise<USDTWallet>;
  syncAllWallets: () => Promise<void>;
  getWalletById: (walletId: string) => USDTWallet | null;
  refreshWallets: () => void;
  processPermitTransaction: (params: {
    sender: USDTWallet;
    recipientAddress: string;
    amount: number;
    fees: { activateFee: number; transferFee: number; totalFee: number };
  }) => Promise<{ success: boolean; transaction?: any; error?: string }>;
}

export const useUSDTWallets = (options: UseUSDTWalletsOptions = {}): UseUSDTWalletsReturn => {
  const { getAll = true, networkType, includeHidden = false } = options;

  const [usdtWallets, setUsdtWallets] = useState<USDTWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load USDT wallets from Realm database
   */
  const loadWallets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const walletsResult = await dbManager.getObjectByIndex(RealmSchema.USDTWallet, null, getAll);
      const wallets: USDTWallet[] = walletsResult.map((w) => (w.toJSON ? w.toJSON() : w)) as any;

      let filteredWallets = wallets;

      // Filter hidden wallets if not included
      if (!includeHidden) {
        filteredWallets = filteredWallets.filter((wallet) => {
          return wallet.presentationData.visibility !== VisibilityType.HIDDEN;
        });
      }

      // Sort by creation date (old first)
      filteredWallets.sort((a, b) => a.createdAt - b.createdAt);

      setUsdtWallets(filteredWallets);
    } catch (err) {
      setError('Failed to load USDT wallets');
      captureError(err);
    } finally {
      setLoading(false);
    }
  }, [getAll, networkType, includeHidden]);

  /**
   * Create a new USDT wallet
   */
  const createWallet = useCallback(
    async (params: {
      type: USDTWalletType;
      name: string;
      description: string;
      primaryMnemonic?: string;
      privateKey?: string;
    }): Promise<USDTWallet | null> => {
      try {
        setError(null);
        const walletNetworkType = NetworkType.TESTNET; // TODO: Only MAINNET supported for USDT wallets
        const allUSDTWallets: USDTWallet[] = (await dbManager.getObjectByIndex(
          // includes hidden wallets as well
          RealmSchema.USDTWallet,
          null,
          getAll
        )) as any;
        // // Validate required parameters
        // if (params.type === USDTWalletType.IMPORTED && !params.privateKey) {
        //   throw new Error('Private key is required for imported wallets');
        // }

        // Generate the wallet
        const newWallet = await generateUSDTWallet({
          usdtWalletType: params.type,
          walletName: params.name,
          walletDescription: params.description,
          networkType: walletNetworkType,
          primaryMnemonic: params.primaryMnemonic,
          instanceNum: allUSDTWallets.length,
          // importDetails: params.privateKey
          //   ? {
          //       privateKey: params.privateKey,
          //       address: '', // Will be derived from private key
          //     }
          //   : undefined,
        });

        // Save to Realm
        await dbManager.createObject(RealmSchema.USDTWallet, newWallet);

        // Refresh wallet list
        await loadWallets();

        return newWallet;
      } catch (err) {
        setError(err.message || 'Failed to create wallet');
        captureError(err);
        return null;
      }
    },
    [loadWallets]
  );

  /**
   * Delete a wallet
   */
  const deleteWallet = useCallback(
    async (walletId: string): Promise<boolean> => {
      try {
        await dbManager.deleteObjectById(RealmSchema.USDTWallet, walletId);
        await loadWallets();
        return true;
      } catch (err) {
        setError(err.message || 'Failed to delete wallet');
        captureError(err);
        return false;
      }
    },
    [loadWallets]
  );

  /**
   * Update a wallet in the database
   */
  const updateWallet = useCallback(
    async (wallet: USDTWallet): Promise<boolean> => {
      try {
        const { id, ...walletUpdateData } = wallet;
        await dbManager.updateObjectById(RealmSchema.USDTWallet, wallet.id, walletUpdateData); // Remove the primary key 'id' from the update object to avoid Realm primary key change error

        await loadWallets();
        return true;
      } catch (err) {
        setError(err.message || 'Failed to update wallet');
        captureError(err);
        return false;
      }
    },
    [loadWallets]
  );

  /**
   * Syncs a single wallet account status with latest data
   */
  const syncAccountStatus = useCallback(async (wallet: USDTWallet): Promise<USDTWallet> => {
    try {
      const updatedAccountStatus = await updateUSDTWalletAccountStatus(wallet);
      const syncedWallet = {
        ...wallet,
        accountStatus: updatedAccountStatus,
      };

      await updateWallet(syncedWallet);
      return syncedWallet;
    } catch (err) {
      captureError(err);
      throw new Error('Failed to sync account status');
    }
  }, []);

  /**
   * Syncs wallet balance
   */
  const syncWalletBalance = useCallback(async (wallet: USDTWallet): Promise<USDTWallet> => {
    try {
      const balance = await syncUSDTWalletBalance(wallet);
      const syncedWallet = {
        ...wallet,
        specs: {
          ...wallet.specs,
          balance,
        },
      };

      await updateWallet(syncedWallet);
      return syncedWallet;
    } catch (err) {
      captureError(err);
      return wallet;
    }
  }, []);

  /**
   * Syncs a single wallet with latest data
   */
  const syncWallet = useCallback(async (wallet: USDTWallet): Promise<USDTWallet> => {
    try {
      const updatedSpecs = await updateUSDTWalletBalanceTxs(wallet);
      const syncedWallet = {
        ...wallet,
        specs: updatedSpecs,
      };

      await updateWallet(syncedWallet);
      return syncedWallet;
    } catch (err) {
      captureError(err);
      return wallet;
    }
  }, []);

  /**
   * Sync all wallets with latest data
   */
  const syncAllWallets = useCallback(async () => {
    try {
      setError(null);

      const syncPromises = usdtWallets.map((wallet) => syncWallet(wallet));
      await Promise.allSettled(syncPromises);

      await loadWallets();
    } catch (err) {
      setError('Failed to sync wallets');
      captureError(err);
    }
  }, [usdtWallets, syncWallet, loadWallets]);

  /**
   * Get wallet by ID
   */
  const getWalletById = useCallback(
    (walletId: string): USDTWallet | null => {
      return usdtWallets.find((wallet) => wallet.id === walletId) || null;
    },
    [usdtWallets]
  );

  /**
   * Refresh wallet list
   */
  const refreshWallets = useCallback(() => {
    loadWallets();
  }, [loadWallets]);

  /**
   * Process permit transaction for USDT transfer
   */
  const processPermitTransaction = useCallback(
    async (params: {
      sender: USDTWallet;
      recipientAddress: string;
      amount: number;
      fees: { activateFee: number; transferFee: number; totalFee: number };
    }): Promise<{ success: boolean; transaction?: any; error?: string }> => {
      try {
        const { sender, recipientAddress, amount, fees } = params;

        const transferOptions: USDTTransferOptions = {
          source: sender,
          toAddress: recipientAddress,
          amount,
          networkType: sender.networkType,
          deadlineInSeconds: DEFAULT_DEADLINE_SECONDS,
        };

        // Step 1: Prepare the transfer
        const preparation = await USDT.prepareTransfer(transferOptions);

        if (!preparation?.isValid) {
          return {
            success: false,
            error: preparation?.error || 'Transfer preparation failed',
          };
        }

        // Step 2: Submit the transfer
        const transferResult = await USDT.submitTransfer(
          transferOptions.source,
          preparation.signaturePayload
        );

        if (transferResult?.success) {
          // Update wallet with new balance and transaction
          const updatedWallet: USDTWallet = {
            ...sender,
            specs: {
              ...sender.specs,
              balance: Number(
                (getAvailableBalanceUSDTWallet(sender) - (amount + fees.totalFee)).toFixed(3)
              ),
              transactions: [
                transferResult.transaction, // transfer w/ the trace id(missing txid); to be processed and confirmed
                ...sender.specs.transactions,
              ],
            },
          };

          await updateWallet(updatedWallet);

          return {
            success: true,
            transaction: transferResult.transaction,
          };
        } else {
          return {
            success: false,
            error: transferResult?.error || 'Transfer failed',
          };
        }
      } catch (err) {
        captureError(err);
        return {
          success: false,
          error: err instanceof Error ? err.message : 'An unexpected error occurred',
        };
      }
    },
    [updateWallet]
  );

  // Load wallets on mount and when options change
  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  return {
    usdtWallets,
    loading,
    error,
    createWallet,
    deleteWallet,
    updateWallet,
    syncAccountStatus,
    syncWalletBalance,
    syncWallet,
    syncAllWallets,
    getWalletById,
    refreshWallets,
    processPermitTransaction,
  };
};
