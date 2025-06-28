import { useState, useEffect, useCallback } from 'react';
import {
  generateUSDTWallet,
  updateUSDTWalletStatus,
  USDTWallet,
  USDTWalletType,
} from '../services/wallets/factories/USDTWalletFactory';
import { NetworkType, VisibilityType } from '../services/wallets/enums';
import dbManager from '../storage/realm/dbManager';
import { RealmSchema } from '../storage/realm/enum';
import { captureError } from '../services/sentry';

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
  syncWallet: (wallet: USDTWallet) => Promise<USDTWallet>;
  syncAllWallets: () => Promise<void>;
  getWalletById: (walletId: string) => USDTWallet | null;
  refreshWallets: () => void;
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
          console.log({ wallet: wallet.presentationData });
          return wallet.presentationData.visibility !== VisibilityType.HIDDEN;
        });
      }

      // Sort by creation date (newest first)
      filteredWallets.sort((a, b) => b.createdAt - a.createdAt);

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
        const walletNetworkType = NetworkType.MAINNET;

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
          instanceNum: usdtWallets.length,
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
   * Sync a single wallet with latest data
   */
  const syncWallet = useCallback(async (wallet: USDTWallet): Promise<USDTWallet> => {
    try {
      const updatedStatus = await updateUSDTWalletStatus(wallet);
      const syncedWallet = {
        ...wallet,
        specs: updatedStatus,
        updatedAt: Date.now(),
      };

      await dbManager.updateObjectById(RealmSchema.USDTWallet, wallet.id, syncedWallet);
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
    syncWallet,
    syncAllWallets,
    getWalletById,
    refreshWallets,
  };
};
