import {
  ELECTRUM_NOT_CONNECTED_ERR,
  ELECTRUM_NOT_CONNECTED_ERR_TOR,
} from 'src/core/services/electrum/client';
import { captureError } from 'src/core/services/sentry';
import { EntityKind } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletOperations from 'src/core/wallets/operations';
import WalletUtilities from 'src/core/wallets/operations/utils';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';

export const refreshWallets = async (payload) => {
  const { wallets } = payload;
  try {
    const network = WalletUtilities.getNetworkByType(wallets[0].networkType);
    const { synchedWallets }: { synchedWallets: (Wallet | Vault)[] } =
      await WalletOperations.syncWalletsViaElectrumClient(wallets, network);

    for (const synchedWallet of synchedWallets) {
      if (!synchedWallet.specs.hasNewUpdates) continue; // no new updates found
      if (synchedWallet.entityKind === EntityKind.VAULT) {
        dbManager.updateObjectById(RealmSchema.Vault, synchedWallet.id, {
          specs: synchedWallet.specs,
        });
      } else {
        dbManager.updateObjectById(RealmSchema.Wallet, synchedWallet.id, {
          specs: synchedWallet.specs,
        });
      }
    }
    const existingWallets = dbManager.getObjectByIndex(RealmSchema.Wallet, null, true);
    let netBalance = 0;
    existingWallets.forEach((wallet) => {
      const { confirmed, unconfirmed } = wallet.specs.balances;
      netBalance = netBalance + confirmed + unconfirmed;
    });

    return { netBalance };
  } catch (err) {
    captureError(err);
    if (
      err.message === ELECTRUM_NOT_CONNECTED_ERR ||
      err.message === ELECTRUM_NOT_CONNECTED_ERR_TOR
    ) {
      throw err.message;
    } else {
      captureError(err);
    }
  }
};
