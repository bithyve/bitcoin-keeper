import { useContext } from 'react';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { whirlPoolWalletTypes } from 'src/core/wallets/factories/WalletFactory';
import { WalletType } from 'src/core/wallets/enums';
import _ from 'lodash';
export const whirlpoolWalletTypeMap = {
  [WalletType.DEFAULT]: 'deposiWallet',
  [WalletType.PRE_MIX]: 'premixWallet',
  [WalletType.POST_MIX]: 'postmixWallet',
  [WalletType.BAD_BANK]: 'badbankWallet',
};

export const getWalletsData = (wallets: Wallet[]) => {
  let walletsDBdata: Wallet[] = _.clone(wallets);
  let walletsData: Wallet | any = [];
  walletsDBdata.forEach((wallet) => {
    if (wallet.type === WalletType.DEFAULT) walletsData.push(wallet);
    if (whirlPoolWalletTypes.includes(wallet.type)) {
      let parentWallet: Wallet = walletsDBdata.find(
        (defaultWallet) => defaultWallet.id === wallet.depositWalletId
      );
      if (parentWallet) {
        parentWallet.whirlpoolConfig[whirlpoolWalletTypeMap[wallet.type]] = wallet;
      }
    }
  });
  return walletsData;
};
const useWallets = ({
  walletIds,
  getAll = false,
  whirlpoolStruct = false,
}: { walletIds?: string[]; getAll?: boolean; whirlpoolStruct?: boolean } = {}) => {
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject) || [];

  if (walletIds) {
    console.log({ walletIds });
    const wallets: Wallet[] =
      useQuery(RealmSchema.Wallet)
        .map(getJSONFromRealmObject)
        .map((wallet) => {
          if (walletIds.includes(wallet.id)) return wallet;
        }) || [];
    return { wallets };
  } else if (getAll) {
    return { wallets };
  } else if (whirlpoolStruct) {
    const whirlpoolStructerdData = getWalletsData(wallets);
    return { wallets: whirlpoolStructerdData };
  } else {
    const wallets: Wallet[] =
      useQuery(RealmSchema.Wallet)
        .map(getJSONFromRealmObject)
        .filter((wallet) => !whirlPoolWalletTypes.includes(wallet.type)) || [];
    return { wallets };
  }
};

export default useWallets;
