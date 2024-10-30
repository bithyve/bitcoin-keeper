import { Alert, Platform } from 'react-native';
import WalletOperations from 'src/services/wallets/operations';
import { captureError } from 'src/services/sentry';
import config from 'src/utils/service-utilities/config';
import { generateSeedWordsKey } from 'src/services/wallets/factories/VaultFactory';
import idx from 'idx';
import { signWithTapsigner, readTapsigner } from 'src/hardware/tapsigner';
import { signWithColdCard } from 'src/hardware/coldcard';
import { isSignerAMF, getPsbtForHwi } from 'src/hardware';
import { EntityKind } from 'src/services/wallets/enums';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import SigningServer from 'src/services/backend/SigningServer';
import { isTestnet } from 'src/constants/Bitcoin';
import * as PORTAL from 'src/hardware/portal';

export const signTransactionWithTapsigner = async ({
  setTapsignerModal,
  signingPayload,
  currentKey,
  withModal,
  defaultVault,
  serializedPSBT,
  card,
  cvc,
  signer,
}) => {
  setTapsignerModal(false);
  const { inputsToSign } = signingPayload[0];
  // AMF flow for signing
  if (isSignerAMF(signer)) {
    await withModal(() => readTapsigner(card, cvc))();
    const { xpriv } = currentKey;
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
    const signedInput = await signWithTapsigner(card, inputsToSign, cvc, currentKey, isTestnet());
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

export const signTransactionWithMobileKey = async ({
  setPasswordModal,
  signingPayload,
  defaultVault,
  serializedPSBT,
  xfp,
}) => {
  setPasswordModal(false);
  const inputs = idx(signingPayload, (_) => _[0].inputs);
  if (!inputs) throw new Error('Invalid signing payload, inputs missing');
  const [signer] = defaultVault.signers.filter((signer) => signer.xfp === xfp);
  const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
    defaultVault,
    inputs,
    serializedPSBT,
    signer.xpriv
  );
  return { signedSerializedPSBT };
};

export const signTransactionWithSigningServer = async ({
  xfp,
  signingPayload,
  signingServerOTP,
  serializedPSBT,
  showOTPModal,
  showToast,
}) => {
  try {
    showOTPModal(false);
    const childIndexArray = idx(signingPayload, (_) => _[0].childIndexArray);
    const outgoing = idx(signingPayload, (_) => _[0].outgoing);
    if (!childIndexArray) throw new Error('Invalid signing payload');

    const { signedPSBT } = await SigningServer.signPSBT(
      xfp,
      signingServerOTP ? Number(signingServerOTP) : null,
      serializedPSBT,
      childIndexArray,
      outgoing
    );
    if (!signedPSBT) throw new Error('signer: failed to sign');
    return { signedSerializedPSBT: signedPSBT };
  } catch (error) {
    captureError(error);
    showToast(`${error.message}`);
  }
};

export const signTransactionWithInheritanceKey = async ({
  signingPayload,
  serializedPSBT,
  xfp,
  requestId,
  inheritanceConfiguration,
  showToast,
}) => {
  try {
    const childIndexArray = idx(signingPayload, (_) => _[0].childIndexArray);
    if (!childIndexArray) throw new Error('Invalid signing payload');

    const { requestStatus, signedPSBT } = await InheritanceKeyServer.signPSBT(
      xfp,
      requestId,
      serializedPSBT,
      childIndexArray,
      inheritanceConfiguration
    );
    return { requestStatus, signedSerializedPSBT: signedPSBT };
  } catch (error) {
    captureError(error);
    showToast(`${error.message}`);
  }
};

export const signTransactionWithSeedWords = async ({
  signingPayload,
  defaultVault,
  seedBasedSingerMnemonic,
  serializedPSBT,
  xfp,
  isMultisig,
}) => {
  try {
    const inputs = idx(signingPayload, (_) => _[0].inputs);
    if (!inputs) throw new Error('Invalid signing payload, inputs missing');
    const [signer] = defaultVault.signers.filter((signer) => signer.xfp === xfp);
    const networkType = config.NETWORK_TYPE;
    // we need this to generate xpriv that's not stored
    const { xpub, xpriv } = generateSeedWordsKey(
      seedBasedSingerMnemonic,
      networkType,
      isMultisig ? EntityKind.VAULT : EntityKind.WALLET
    );
    if (signer.xpub !== xpub) throw new Error('Invalid mnemonic; xpub mismatch');
    const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
      defaultVault,
      inputs,
      serializedPSBT,
      xpriv
    );
    return { signedSerializedPSBT };
  } catch (err) {
    Alert.alert(err?.message);
  }
};

export const signTransactionWithPortal = async ({
  setPortalModal,
  withNfcModal,
  serializedPSBTEnvelop,
  closeNfc,
  vault,
  portalCVC,
}) => {
  const signPsbtPortal = async (psbt) => {
    await PORTAL.startReading();
    let status = await PORTAL.getStatus();
    if (!status.unlocked) {
      if (!portalCVC) throw new Error('Portal is locked. Pin is required');
      const res = await PORTAL.unlock(portalCVC);
    }
    status = await PORTAL.getStatus();
    if (!status.unlocked) {
      throw new Error('Portal not unlocked');
    }
    const signedRes = await PORTAL.signPSBT(psbt);
    PORTAL.stopReading();
    return { signedSerializedPSBT: signedRes };
  };

  try {
    const psbtForPortal = await getPsbtForHwi(serializedPSBTEnvelop.serializedPSBT, vault); // portal requires non-witness utxo also.
    setPortalModal(false);
    if (Platform.OS === 'android') {
      return await withNfcModal(async () => await signPsbtPortal(psbtForPortal.serializedPSBT));
    } else {
      // modal not required for ios// created by portal utility
      return signPsbtPortal(psbtForPortal.serializedPSBT);
    }
  } catch (error) {
    console.log('🚀 ~ error:', error);
    closeNfc();

    throw error;
  } finally {
    PORTAL.stopReading();
  }
};
