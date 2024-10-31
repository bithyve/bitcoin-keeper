/* eslint-disable no-await-in-loop */
import { Alert, Platform } from 'react-native';
import { CKTapCard } from 'cktap-protocol-react-native';
import { captureError } from 'src/services/sentry';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { ScriptTypes, XpubTypes } from 'src/services/wallets/enums';
import { VaultSigner, XpubDetailsType } from 'src/services/wallets/interfaces/vault';
import NFC from 'src/services/nfc';
import { CommonActions } from '@react-navigation/native';
import { xpubToTpub } from 'src/hardware';

const getScriptSpecificDetails = async (card, cvc, isTestnet, isMultisig) => {
  const xpubDetails: XpubDetailsType = {};
  // fetch P2WPKH details
  const singleSigPath = WalletUtilities.getDerivationForScriptType(ScriptTypes.P2WPKH);
  await card.set_derivation(singleSigPath.split("'").join('h'), cvc);
  let singleSigXpub = await card.get_xpub(cvc);
  if (isTestnet) {
    singleSigXpub = xpubToTpub(singleSigXpub);
  }
  xpubDetails[XpubTypes.P2WPKH] = { xpub: singleSigXpub, derivationPath: singleSigPath };
  // fetch P2WSH details
  const multiSigPath = WalletUtilities.getDerivationForScriptType(ScriptTypes.P2WSH);
  await card.set_derivation(multiSigPath.split("'").join('h'), cvc);
  let multiSigXpub = await card.get_xpub(cvc);
  if (isTestnet) {
    multiSigXpub = xpubToTpub(multiSigXpub);
  }
  xpubDetails[XpubTypes.P2WSH] = { xpub: multiSigXpub, derivationPath: multiSigPath };
  // fetch masterfingerprint
  const xfp = await card.get_xfp(cvc);
  const xpub = isMultisig ? multiSigXpub : singleSigXpub;
  const derivationPath = isMultisig ? multiSigPath : singleSigPath;
  return {
    xpub,
    masterFingerprint: xfp.toString('hex').toUpperCase(),
    derivationPath,
    xpubDetails,
  };
};

export const getTapsignerDetails = async (
  card: CKTapCard,
  cvc: string,
  isTestnet: boolean,
  isMultisig: boolean
) => {
  const status = await card.first_look();
  const isLegit = await card.certificate_check();
  if (isLegit) {
    if (status.is_testnet !== isTestnet) {
      card.set_is_testnet(isTestnet);
    }
    if (status.path) {
      const { xpub, masterFingerprint, derivationPath, xpubDetails } =
        await getScriptSpecificDetails(card, cvc, isTestnet, isMultisig);
      // reset to original path
      await card.set_derivation(status.path, cvc);
      return { xpub, masterFingerprint, derivationPath, xpubDetails };
    }
    try {
      await card.setup(cvc);
    } catch (e) {
      // Card likely already set up
      console.log('Failed to set up TAPSIGNER', e);
    }
    const newCard = await card.first_look();
    const { xpub, masterFingerprint, derivationPath, xpubDetails } = await getScriptSpecificDetails(
      newCard,
      cvc,
      isTestnet,
      isMultisig
    );
    await card.set_derivation(newCard.path, cvc);
    return { xpub, masterFingerprint, derivationPath, xpubDetails };
  }
  throw new Error('Error certificate verification failed! Card may not be legit!');
};

export const unlockRateLimit = async (card: CKTapCard) => {
  const status = await card.first_look();
  const isLegit = await card.certificate_check();
  let authDelay = status.auth_delay;
  if (!authDelay) {
    return { authDelay };
  }
  if (isLegit) {
    while (authDelay !== 0) {
      if (Platform.OS === 'ios')
        NFC.showiOSMessage(`Keep tapsigner connected for ${authDelay} seconds.`);
      const { auth_delay } = await card.wait();
      if (!auth_delay) {
        return { authDelay: 0 };
      }
      authDelay = auth_delay;
    }
    return { authDelay };
  }
  throw new Error('Error certificate verification failed! Card may not be legit!');
};

export const downloadBackup = async (card: CKTapCard, cvc: string) => {
  const status = await card.first_look();
  const isLegit = await card.certificate_check();
  if (isLegit) {
    if (status.path) {
      const backup = await card.make_backup(cvc);

      return {
        backup: backup.toString('base64'),
        cardId: status.card_ident,
      };
    } else {
      throw new Error('Please set up card before backup!');
    }
  }
  throw new Error('Error certificate verification failed! Card may not be legit!');
};

export const getCardInfo = async (card: CKTapCard) => {
  const status = await card.first_look();
  const isLegit = await card.certificate_check();
  if (isLegit) {
    return {
      backupsCount: status.num_backups,
      cardId: status.card_ident,
      birthHeight: status.birth_height,
      path: status.path,
    };
  }
  throw new Error('Error certificate verification failed! Card may not be legit!');
};

export const changePin = async (card: CKTapCard, oldCVC: string, newCVC: string) => {
  const status = await card.first_look();
  const isLegit = await card.certificate_check();
  if (isLegit) {
    if (isNaN(status.num_backups) || status.num_backups === 0) {
      throw new Error('425 on change: backup first');
    }
    const res = await card.change_cvc(oldCVC, newCVC);
    return res;
  }
  throw new Error('Error certificate verification failed! Card may not be legit!');
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
  signer: VaultSigner,
  isTestnet: boolean
) => {
  const status = await card.first_look();
  const isLegit = await card.certificate_check();
  if (isLegit) {
    try {
      if (status.path) {
        if (status.is_testnet !== isTestnet) {
          card.set_is_testnet(isTestnet);
        }
        for (const input of inputsToSign) {
          const digest = Buffer.from(input.digest, 'hex');
          const subpath = input.subPath;
          await card.set_derivation(signer.derivationPath.split("'").join('h'), cvc);
          const signature = await card.sign_digest(cvc, 0, digest, subpath);
          input.signature = signature.slice(1).toString('hex');
        }
        return inputsToSign;
      }
      Alert.alert('Please set up card before signing!');
      throw Error('Please set up card before signing!');
    } catch (e) {
      captureError(e);
      throw e;
    } finally {
      await card.set_derivation(status.path, cvc);
    }
  }
  throw new Error('Error certificate verification failed! Card may not be legit!');
};

// For test purposes only
export const readTapsigner = async (card: CKTapCard, cvc: string) => {
  await card.first_look();
  await card.read(cvc);
};

export const handleTapsignerError = (error, navigation) => {
  let errorMessage = null;
  if (error.toString().includes('401')) {
    errorMessage = 'Please check the PIN entered and try again!';
  } else if (error.toString().includes('429')) {
    errorMessage = 'You have exceed the PIN retry limit. Please unlock the card and try again!';
  } else if (error.toString().includes('425')) {
    errorMessage = 'Must backup the card before changing the PIN';
  } else if (error.toString().includes('205')) {
    errorMessage = 'Something went wrong, please try again!';
  } else if (error.toString() === 'Error' || error.toString() === '[Error]') {
    errorMessage = 'Operation cancelled. Please try again.';
  }

  if (errorMessage) {
    if (Platform.OS === 'ios') NFC.showiOSErrorMessage(errorMessage);
  } else {
    const errorMessage = 'Something went wrong, please try again!';
    if (Platform.OS === 'ios') NFC.showiOSErrorMessage(errorMessage);
  }

  if (errorMessage && errorMessage.includes('retry limit')) {
    navigation.dispatch(CommonActions.navigate('UnlockTapsigner'));
  }

  return errorMessage;
};
