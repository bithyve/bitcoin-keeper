import _ from 'lodash';
import { useContext } from 'react';
import { EntityKind, WalletType } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const useWhirlpoolWallets = ({ wallet }: { wallet: Wallet | Vault }) => {
  const { whirlpoolConfig = null } = wallet;
  const Schema = wallet.entityKind === EntityKind.WALLET ? RealmSchema.Wallet : RealmSchema.Vault;
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets = useQuery(Schema);
  const currentWallet = getJSONFromRealmObject(wallet);
  if (whirlpoolConfig) {
    const { whirlpoolWalletDetails } = whirlpoolConfig;
    whirlpoolWalletDetails.forEach((whirlpoolWalletDetail) => {
      const { walletId, walletType } = whirlpoolWalletDetail;
      const whirlpoolWallet = wallets
        .filtered(`id == "${walletId}"`)
        .map(getJSONFromRealmObject)[0];
      if (walletType === WalletType.PRE_MIX) {
        currentWallet.whirlpoolConfig.premixWallet = whirlpoolWallet;
      } else if (walletType === WalletType.POST_MIX) {
        currentWallet.whirlpoolConfig.postmixWallet = whirlpoolWallet;
      } else if (walletType === WalletType.BAD_BANK) {
        currentWallet.whirlpoolConfig.badbankWallet = whirlpoolWallet;
      }
    });
    return { wallet: currentWallet };
  }
  return { wallet: currentWallet };
};

export default useWhirlpoolWallets;
