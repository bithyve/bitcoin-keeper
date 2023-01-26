import { Alert } from 'react-native';
import WalletOperations from 'src/core/wallets/operations';
import { captureError } from 'src/core/services/sentry';
import config from 'src/core/config';
import { generateSeedWordsKey } from 'src/core/wallets/factories/VaultFactory';
import idx from 'idx';
import { signWithTapsigner, readTapsigner } from 'src/hardware/tapsigner';
import { signWithColdCard } from 'src/hardware/coldcard';
import { isSignerAMF } from 'src/hardware';

export const signTransactionWithTapsigner = async ({
  setTapsignerModal,
  signingPayload,
  currentSigner,
  withModal,
  defaultVault,
  serializedPSBT,
  card,
  cvc,
}) => {
  setTapsignerModal(false);
  const { inputsToSign } = signingPayload[0];
  // AMF flow for signing
  if (isSignerAMF(currentSigner)) {
    await withModal(() => readTapsigner(card, cvc))();
    const { xpriv } = currentSigner;
    const inputs = idx(signingPayload, (_) => _[0].inputs);
    if (!inputs) throw new Error('Invalid signing payload, inputs missing');
    const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
      defaultVault,
      inputs,
      serializedPSBT,
      xpriv
    );
    return { signedSerializedPSBT, signingPayload: null };
  }
  return withModal(async () => {
    const signedInput = await signWithTapsigner(card, inputsToSign, cvc, currentSigner);
    signingPayload.forEach((payload) => {
      payload.inputsToSign = signedInput;
    });
    return { signingPayload, signedSerializedPSBT: null };
  })();
};

export const signTransactionWithColdCard = async ({
  setColdCardModal,
  withNfcModal,
  serializedPSBTEnvelop,
  closeNfc,
}) => {
  try {
    setColdCardModal(false);
    await withNfcModal(async () => signWithColdCard(serializedPSBTEnvelop.serializedPSBT));
  } catch (error) {
    if (error.toString() === 'Error') {
      // ignore if nfc modal is dismissed
    } else {
      closeNfc();
      captureError(error);
    }
  }
};

export const signTransactionWithLedger = async ({
  setLedgerModal,
  currentSigner,
  signingPayload,
  defaultVault,
  serializedPSBT,
}) => {
  try {
    setLedgerModal(false);
    if (isSignerAMF(currentSigner)) {
      const { xpriv } = currentSigner;
      const inputs = idx(signingPayload, (_) => _[0].inputs);
      if (!inputs) throw new Error('Invalid signing payload, inputs missing');
      const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
        defaultVault,
        inputs,
        serializedPSBT,
        xpriv
      );
      return { signedSerializedPSBT };
    }
  } catch (error) {
    switch (error.message) {
      case 'Ledger device: UNKNOWN_ERROR (0x6b0c)':
        Alert.alert('Unlock the device to connect.');
        break;
      case 'Ledger device: UNKNOWN_ERROR (0x6a15)':
        Alert.alert('Navigate to the correct app in the Ledger.');
        break;
      case 'Ledger device: UNKNOWN_ERROR (0x6511)':
        Alert.alert('Open up the correct app in the Ledger.'); // no app selected
        break;
      // unknown error
      default:
        captureError(error);
        Alert.alert('Something went wrong! Please try again');
    }
  }
};

export const signTransactionWithMobileKey = async ({
  setPasswordModal,
  signingPayload,
  defaultVault,
  serializedPSBT,
  signerId,
}) => {
  setPasswordModal(false);
  const inputs = idx(signingPayload, (_) => _[0].inputs);
  if (!inputs) throw new Error('Invalid signing payload, inputs missing');
  const [signer] = defaultVault.signers.filter((signer) => signer.signerId === signerId);
  const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
    defaultVault,
    inputs,
    serializedPSBT,
    signer.xpriv
  );
  return { signedSerializedPSBT };
};

export const signTransactionWithSigningServer = async ({
  showOTPModal,
  keeper,
  signingPayload,
  signingServerOTP,
  serializedPSBT,
  SigningServer,
}) => {
  try {
    showOTPModal(false);
    const childIndexArray = idx(signingPayload, (_) => _[0].childIndexArray);
    const outgoing = idx(signingPayload, (_) => _[0].outgoing);
    if (!childIndexArray) throw new Error('Invalid signing payload');
    const { signedPSBT } = await SigningServer.signPSBT(
      keeper.id,
      signingServerOTP ? Number(signingServerOTP) : null,
      serializedPSBT,
      childIndexArray,
      outgoing
    );
    if (!signedPSBT) throw new Error('signing server: failed to sign');
    return { signedSerializedPSBT: signedPSBT };
  } catch (error) {
    captureError(error);
    Alert.alert(error.message);
  }
};

export const signTransactionWithSeedWords = async ({
  signingPayload,
  defaultVault,
  seedBasedSingerMnemonic,
  serializedPSBT,
  signerId,
}) => {
  try {
    const inputs = idx(signingPayload, (_) => _[0].inputs);
    if (!inputs) throw new Error('Invalid signing payload, inputs missing');
    const [signer] = defaultVault.signers.filter((signer) => signer.signerId === signerId);
    const networkType = config.NETWORK_TYPE;
    const { xpub, xpriv } = generateSeedWordsKey(seedBasedSingerMnemonic, networkType);
    if (signer.xpub !== xpub) throw new Error('Invalid mnemonic; xpub mismatch');
    const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
      defaultVault,
      inputs,
      serializedPSBT,
      xpriv
    );
    return { signedSerializedPSBT };
  } catch (err) {
    Alert.alert(err);
  }
};
