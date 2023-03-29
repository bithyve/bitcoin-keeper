import { useContext } from 'react';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { WalletType } from 'src/core/wallets/enums';
import useWhirlpoolWallets from './useWhirlpoolWallets';

export const whirlpoolWalletTypeMap = {
  [WalletType.DEFAULT]: 'deposiWallet',
  [WalletType.PRE_MIX]: 'premixWallet',
  [WalletType.POST_MIX]: 'postmixWallet',
  [WalletType.BAD_BANK]: 'badbankWallet',
};

const useWallets = ({
  walletIds,
  getAll = false,
  whirlpoolStruct = false,
}: { walletIds?: string[]; getAll?: boolean; whirlpoolStruct?: boolean } = {}) => {
  const { useQuery, useObject } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet);
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
    if (whirlpoolStruct) {
      const whirlpoolWallets = [];
      for (let index = 0; index < extractedWallets.length; index += 1) {
        const element = extractedWallets[index];
        const { wallet } = useWhirlpoolWallets({ wallet: element });
        if (wallet) {
          whirlpoolWallets.push(wallet);
        }
      }
      return { wallets: whirlpoolWallets };
    }
    return { wallets: extractedWallets.map(getJSONFromRealmObject) };
  }
  if (whirlpoolStruct) {
    const whirlpoolWallets = [];
    for (let index = 0; index < wallets.length; index += 1) {
      const element = wallets[index];
      const { wallet } = useWhirlpoolWallets({ wallet: element });
      if (wallet) {
        whirlpoolWallets.push(wallet);
      }
    }
    return { wallets: whirlpoolWallets };
  }
  const walletsWithoutWhirlpool: Wallet[] = useQuery(RealmSchema.Wallet).filtered(
    `type != "${WalletType.PRE_MIX}" && type != "${WalletType.POST_MIX}" && type != "${WalletType.BAD_BANK}"`
  );
  return { wallets: walletsWithoutWhirlpool.map(getJSONFromRealmObject) };
};

export default useWallets;
