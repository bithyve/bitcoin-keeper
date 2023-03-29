import { WalletType } from 'src/core/wallets/enums';
import { whirlPoolWalletTypes } from 'src/core/wallets/factories/WalletFactory';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

// TODO: generalize this hook to be consumed at Vault
const useWhirlpoolWallets = ({ wallet, wallets }: { wallet: Wallet | Vault; wallets }) => {
  const { whirlpoolConfig = null } = wallet;
  const currentWallet = getJSONFromRealmObject(wallet);
  if (whirlPoolWalletTypes.includes(wallet.type)) {
    return { wallet: null };
  }
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
