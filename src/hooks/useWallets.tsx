import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { VisibilityType, WalletType } from 'src/services/wallets/enums';
import { useObject, useQuery } from '@realm/react';
import { useAppSelector } from 'src/store/hooks';

type useWalletsInterface = ({ getAll, walletIds }?: { getAll?: boolean; walletIds?: string[] }) => {
  wallets: Wallet[];
};

const useWallets: useWalletsInterface = ({ walletIds = [], getAll = false } = {}) => {
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);
  const allWallets: Wallet[] = useQuery(RealmSchema.Wallet);
  if (getAll) {
    if (bitcoinNetworkType)
      return {
        wallets: allWallets
          .map(getJSONFromRealmObject)
          .filter((wallet) => wallet.networkType === bitcoinNetworkType),
      };

    return { wallets: allWallets.map(getJSONFromRealmObject) };
  }
  const allWalletsNonHidden = allWallets.filter(
    (wallet) => wallet.presentationData.visibility == VisibilityType.DEFAULT
  );
  walletIds = walletIds?.filter((item) => !!item);
  if (walletIds && walletIds.length) {
    const extractedWallets = [];
    for (let index = 0; index < walletIds.length; index += 1) {
      const id = walletIds[index];
      const wallet: Wallet = useObject(RealmSchema.Wallet, id);
      if (wallet) extractedWallets.push(wallet);
    }
    return { wallets: extractedWallets.map(getJSONFromRealmObject) };
  }

  return { wallets: allWalletsNonHidden.map(getJSONFromRealmObject) };
};

export default useWallets;
