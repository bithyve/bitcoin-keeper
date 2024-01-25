import config from 'src/core/config';
import { SignerType, WalletType } from 'src/core/wallets/enums';
import { generateWallet, getCosignerDetails } from 'src/core/wallets/factories/WalletFactory';
import { Signer } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';

export const generateCollaborativeKeySelf = async (wallets: Wallet[], signers: Signer[]) => {
  const myCollaborativeKeys = signers.filter((signer) => signer.type === SignerType.MY_KEEPER);
  const myCollaborativeKeyCount = myCollaborativeKeys.length;

  const temporaryWallet = wallets[myCollaborativeKeyCount]
    ? wallets[myCollaborativeKeyCount]
    : await generateWallet({
        type: WalletType.DEFAULT,
        instanceNum: myCollaborativeKeyCount - 1,
        networkType: config.NETWORK_TYPE,
        walletName: 'temporary',
        walletDescription: 'temporary',
      });

  return getCosignerDetails(temporaryWallet);
};
