import { HWErrorType } from 'src/models/enums/Hardware';
import config from 'src/utils/service-utilities/config';
import WalletUtilities from 'src/services/wallets/operations/utils';
import HWError from '../HWErrorState';

const getPassportDetails = (qrData) => {
  let parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
  try {
    const { p2wsh, p2wsh_deriv: derivationPath, xfp } = parsedData;
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    const xpub = WalletUtilities.getXpubFromExtendedKey(p2wsh, network);
    return { xpub, derivationPath, masterFingerprint: xfp, forMultiSig: true, forSingleSig: false };
  } catch (_) {
    console.log('Not exported for multisig!');
  }

  try {
    const { xpub, deriv } = parsedData.bip84;
    return {
      xpub,
      derivationPath: deriv,
      masterFingerprint: parsedData.xfp,
      forMultiSig: false,
      forSingleSig: true,
    };
  } catch (_) {
    console.log('Not exported for singlesig!');
    throw new HWError(HWErrorType.INCORRECT_HW);
  }
};

export { getPassportDetails };
