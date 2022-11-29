import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';

export const getKeystoneDetails = (qrData) => {
  const { derivationPath, xPub, mfp } = qrData;
  const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
  const xpub = WalletUtilities.generateXpubFromYpub(xPub, network);
  return { xpub, derivationPath, xfp: mfp };
};
