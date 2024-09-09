/* eslint-disable no-await-in-loop */
import { Alert } from 'react-native';
import { CKTapCard } from 'cktap-protocol-react-native';
import { captureError } from 'src/services/sentry';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { ScriptTypes, XpubTypes } from 'src/services/wallets/enums';
import { VaultSigner, XpubDetailsType } from 'src/services/wallets/interfaces/vault';

const getScriptSpecificDetails = async (card, cvc, isMultisig) => {
  const xpubDetails: XpubDetailsType = {};
  // fetch P2WPKH details
  const singleSigPath = WalletUtilities.getDerivationForScriptType(ScriptTypes.P2WPKH);
  await card.set_derivation(singleSigPath.split("'").join('h'), cvc);
  const singleSigXpub = await card.get_xpub(cvc);
  xpubDetails[XpubTypes.P2WPKH] = { xpub: singleSigXpub, derivationPath: singleSigPath };
  // fetch P2WSH details
  const multiSigPath = WalletUtilities.getDerivationForScriptType(ScriptTypes.P2WSH);
  await card.set_derivation(multiSigPath.split("'").join('h'), cvc);
  const multiSigXpub = await card.get_xpub(cvc);
  xpubDetails[XpubTypes.P2WSH] = { xpub: multiSigXpub, derivationPath: multiSigPath };
  // fetch masterfingerprint
  const xfp = await card.get_xfp(cvc);
  const xpub = isMultisig ? multiSigXpub : singleSigXpub;
  const derivationPath = isMultisig ? multiSigPath : singleSigPath;
  return { xpub, masterFingerprint: xfp.toString('hex'), derivationPath, xpubDetails };
};

export const getTapsignerDetails = async (card: CKTapCard, cvc: string, isMultisig: boolean) => {
  const status = await card.first_look();
  const isLegit = await card.certificate_check();
  if (isLegit) {
    if (status.path) {
      const { xpub, masterFingerprint, derivationPath, xpubDetails } =
        await getScriptSpecificDetails(card, cvc, isMultisig);
      // reset to original path
      await card.set_derivation(status.path, cvc);
      return { xpub, masterFingerprint, derivationPath, xpubDetails };
    }
    await card.setup(cvc);
    const newCard = await card.first_look();
    const { xpub, masterFingerprint, derivationPath, xpubDetails } = await getScriptSpecificDetails(
      newCard,
      cvc,
      isMultisig
    );
    // reset to original path
    await card.set_derivation(status.path, cvc);
    return { xpub, masterFingerprint, derivationPath, xpubDetails };
  }
};

export const unlockRateLimit = async (card: CKTapCard) => {
  const status = await card.first_look();
  const isLegit = await card.certificate_check();
  let authDelay = status.auth_delay;
  if (!authDelay) {
    return { authDelay };
  }
  if (isLegit && status.auth_delay) {
    while (authDelay !== 0) {
      const { auth_delay } = await card.wait();
      if (!auth_delay) {
        return { authDelay: 0 };
      }
      authDelay = auth_delay;
    }
  }
};
export const changePin = async (card: CKTapCard, oldCVC: string, newCVC: string) => {
  const status = await card.first_look();
  console.log('🚀 ~ changePin ~ status:', status);
  const isLegit = await card.certificate_check();
  console.log('🚀 ~ changePin ~ isLegit:', isLegit);
  const res = await card.change_cvc(oldCVC, newCVC);
  console.log('🚀 ~ changePin ~ res:', res);
  return res;
};

export const signWithTapsigner = async (
  card: CKTapCard,
  inputsToSign: {
    digest: string;
    subPath: string;
    inputIndex: number;
    sighashType: number;
    publicKey: string;
    signature?: string;
  }[],
  cvc,
  signer: VaultSigner
) => {
  const status = await card.first_look();
  try {
    if (status.path) {
      for (const input of inputsToSign) {
        const digest = Buffer.from(input.digest, 'hex');
        const subpath = input.subPath;
        await card.set_derivation(signer.derivationPath.split("'").join('h'), cvc);
        const signature = await card.sign_digest(cvc, 0, digest, subpath);
        input.signature = signature.slice(1).toString('hex');
      }
      return inputsToSign;
    }
    Alert.alert('Please setup card before signing!');
  } catch (e) {
    captureError(e);
  } finally {
    await card.set_derivation(status.path, cvc);
  }
};

export const readTapsigner = async (card: CKTapCard, cvc: string) => {
  await card.first_look();
  await card.read(cvc);
};

export const getTapsignerErrorMessage = (error) => {
  let message;
  if (error.toString().includes('401')) {
    message = 'Please check the CVC entered and try again!';
  } else if (error.toString().includes('429')) {
    message = 'You have exceed the cvc retry limit. Please unlock the card and try again!';
  } else if (error.toString().includes('205')) {
    message = 'Something went wrong, please try again!';
  } else if (error.toString() === 'Error') {
    // do nothing when nfc is dismissed
    message = '';
  }
  return message;
};
