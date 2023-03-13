import { useContext } from 'react';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { whirlPoolWalletTypes } from 'src/core/wallets/factories/WalletFactory';

const useWallets = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] =
    useQuery(RealmSchema.Wallet)
      .map(getJSONFromRealmObject)
      .filter((wallet) => !whirlPoolWalletTypes.includes(wallet.type)) || [];
  return { wallets };
};

export default useWallets;
