import { useContext } from 'react';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { WalletType } from 'src/core/wallets/enums';

type useWalletsInterface = ({ getAll, walletIds }?: { getAll?: boolean; walletIds?: string[] }) => {
  wallets: Wallet[];
};

const useWallets: useWalletsInterface = ({ walletIds, getAll = false } = {}) => {
  const { useQuery, useObject } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet);
  const walletsWithoutWhirlpool: Wallet[] = useQuery(RealmSchema.Wallet).filtered(
    `type != "${WalletType.PRE_MIX}" && type != "${WalletType.POST_MIX}" && type != "${WalletType.BAD_BANK}"`
  );
  if (getAll) {
    return { wallets: wallets.map(getJSONFromRealmObject) };
  }
  if (walletIds) {
    const extractedWallets = [];
    for (let index = 0; index < walletIds.length; index += 1) {
      const id = walletIds[index];
      const wallet: Wallet = useObject(RealmSchema.Wallet, id);
      extractedWallets.push(wallet);
    }
    return { wallets: extractedWallets.map(getJSONFromRealmObject) };
  }
  return { wallets: walletsWithoutWhirlpool.map(getJSONFromRealmObject) };
};

export default useWallets;
