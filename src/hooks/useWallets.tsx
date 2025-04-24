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
  const allWallets: Wallet[] = useQuery(RealmSchema.Wallet).filter((wallet) =>
    [WalletType.DEFAULT, WalletType.IMPORTED].includes(wallet.type)
  );

  const filterByNetwork = (wallets) => {
    if (bitcoinNetworkType)
      return wallets
        .map(getJSONFromRealmObject)
        .filter((wallet) => wallet.networkType === bitcoinNetworkType);
    else return wallets;
  };

  if (getAll) {
    return { wallets: filterByNetwork(allWallets) };
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
    return { wallets: filterByNetwork(extractedWallets) };
  }

  return { wallets: filterByNetwork(allWalletsNonHidden) };
};

export default useWallets;
