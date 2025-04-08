import { HWErrorType } from 'src/models/enums/Hardware';
import WalletUtilities from 'src/services/wallets/operations/utils';
import HWError from '../HWErrorState';
import { store } from 'src/store/store';

const getPassportDetails = (qrData, returnTaproot = false) => {
  let parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
  try {
    const { bitcoinNetworkType } = store.getState().settings;
    const { p2wsh, p2wsh_deriv: derivationPath, xfp } = parsedData;
    const network = WalletUtilities.getNetworkByType(bitcoinNetworkType);
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
      ...(returnTaproot
        ? {
            taproot: {
              xPub: parsedData?.bip86?.xpub,
              derivationPath: parsedData?.bip86?.deriv,
              mfp: parsedData?.bip86?.xfp,
            },
          }
        : {}),
    };
  } catch (_) {
    console.log('Not exported for singlesig!');
    throw new HWError(HWErrorType.INCORRECT_HW);
  }
};

export const manipulatePassportDetails = (data) => {
  return {
    mfp: data.masterFingerprint,
    derivationPath: data.derivationPath,
    xPub: data.xpub,
    taproot: data?.taproot,
  };
};

export { getPassportDetails };
