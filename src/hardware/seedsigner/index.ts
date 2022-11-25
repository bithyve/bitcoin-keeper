import config from 'src/core/config';
import WalletUtilities from 'src/core/wallets/operations/utils';

export const getSeedSignerDetails = (qrData) => {
  let xpub = qrData.slice(qrData.indexOf(']') + 1);
  const xfp = qrData.slice(1, 9);
  const derivationPath = qrData
    .slice(qrData.indexOf('[') + 1, qrData.indexOf(']'))
    .replace(xfp, 'm');

  const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
  xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
  return { xpub, derivationPath, xfp };
};
