import { WalletType } from 'src/core/wallets/enums';
import { whirlPoolWalletTypes } from 'src/core/wallets/factories/WalletFactory';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { RealmSchema } from 'src/storage/realm/enum';
import { useContext } from 'react';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';

export interface whirlpoolWalletAccountMapInterface {
  premixWallet?: Wallet;
  postmixWallet?: Wallet;
  badbankWallet?: Wallet;
}
export interface whirlpoolWalletsAccountsMapInterface {
  [key: string]: whirlpoolWalletAccountMapInterface;
}
type useWhirlpoolWalletsInterface = ({
  wallets,
}: {
  wallets: any[];
}) => whirlpoolWalletsAccountsMapInterface;

// TODO: generalize this hook to be consumed at Vault
const useWhirlpoolWallets: useWhirlpoolWalletsInterface = ({ wallets }) => {
  const { useQuery } = useContext(RealmWrapperContext);
  const allWallets = useQuery(RealmSchema.Wallet);
  let whirlpoolWalletsAccountsMap = {};
  wallets.forEach((wallet) => {
    const { whirlpoolConfig = null } = wallet;
    if (whirlPoolWalletTypes.includes(wallet.type)) {
    }
    if (whirlpoolConfig) {
      let whirlpoolAccountMap: whirlpoolWalletAccountMapInterface = {};
      const { whirlpoolWalletDetails } = whirlpoolConfig;
      whirlpoolWalletDetails.forEach((whirlpoolWalletDetail) => {
        const { walletId, walletType } = whirlpoolWalletDetail;
        const whirlpoolWallet: Wallet = allWallets
          .filtered(`id == "${walletId}"`)
          .map(getJSONFromRealmObject)[0];
        if (walletType === WalletType.PRE_MIX) {
          whirlpoolAccountMap.premixWallet = whirlpoolWallet;
        } else if (walletType === WalletType.POST_MIX) {
          whirlpoolAccountMap.postmixWallet = whirlpoolWallet;
        } else if (walletType === WalletType.BAD_BANK) {
          whirlpoolAccountMap.badbankWallet = whirlpoolWallet;
        }
      });
      whirlpoolWalletsAccountsMap[wallet.id] = whirlpoolAccountMap;
    }
  });
  return whirlpoolWalletsAccountsMap;
};

export default useWhirlpoolWallets;
