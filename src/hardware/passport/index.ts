import { HWErrorType } from 'src/common/data/enums/Hardware';
import config from 'src/core/config';
import WalletUtilities from 'src/core/wallets/operations/utils';
import HWError from '../HWErrorState';

const getPassportDetails = (qrData) => {
  try {
    const { p2wsh, p2wsh_deriv: derivationPath, xfp } = qrData;
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    const xpub = WalletUtilities.generateXpubFromYpub(p2wsh, network);
    return { xpub, derivationPath, xfp, forMultiSig: true, forSingleSig: false };
  } catch (_) {
    console.log('Not exported for multisig!');
  }

  try {
    const { xpub, deriv } = qrData.bip84;
    return { xpub, derivationPath: deriv, xfp: qrData.xfp, forMultiSig: false, forSingleSig: true };
  } catch (_) {
    console.log('Not exported for singlesig!');
    throw new HWError(HWErrorType.INCORRECT_HW);
  }
};

export { getPassportDetails };
