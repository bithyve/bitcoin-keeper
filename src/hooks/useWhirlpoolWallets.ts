import { WalletType } from 'src/services/wallets/enums';
import { whirlPoolWalletTypes } from 'src/services/wallets/factories/WalletFactory';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { RealmSchema } from 'src/storage/realm/enum';
import { useQuery } from '@realm/react';

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
  const allWallets = useQuery(RealmSchema.Wallet);
  const whirlpoolWalletsAccountsMap = {};
  wallets.forEach((wallet) => {
    const { whirlpoolConfig = null } = wallet;
    if (whirlPoolWalletTypes.includes(wallet.type)) {
    }
    if (whirlpoolConfig) {
      const whirlpoolAccountMap: whirlpoolWalletAccountMapInterface = {};
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
