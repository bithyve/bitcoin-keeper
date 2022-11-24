import config from 'src/core/config';
import WalletUtilities from 'src/core/wallets/operations/utils';

export const getPassportDetails = (qrData) => {
  const { p2wsh, p2wsh_deriv, xfp } = qrData;
  const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
  const xpub = WalletUtilities.generateXpubFromYpub(p2wsh, network);
  return { xpub, derivationPath: p2wsh_deriv, xfp };
};
