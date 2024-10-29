import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import {
  PortalSdk,
  type NfcOut,
  type CardStatus,
  Network,
  MnemonicWords,
} from 'libportal-react-native';
import { XpubTypes } from 'src/services/wallets/enums';
import { XpubDetailsType } from 'src/services/wallets/interfaces/vault';
import { Platform } from 'react-native';

const sdk = new PortalSdk(true);
let keepReading = false;
let alreadyInited = false;
let livenessCheckInterval: NodeJS.Timeout;

function livenessCheck(): Promise<NfcOut> {
  return new Promise((_resolve, reject) => {
    livenessCheckInterval = setInterval(() => {
      NfcManager.getTag()
        .then(() => NfcManager.transceive([0x30, 0xed]))
        .catch(() => {
          NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
          clearInterval(livenessCheckInterval);

          reject(new Error('Removed tag'));
        });
    }, 250);
  });
}

async function manageTag() {
  await sdk.newTag();
  const check = livenessCheck();

  // eslint-disable-next-line no-unmodified-loop-condition
  while (keepReading) {
    const msg = await Promise.race([sdk.poll(), check]);
    // console.trace('>', msg.data);
    const result = await NfcManager.nfcAHandler.transceive(msg.data);
    // console.trace('<', result);
    await sdk.incomingData(msg.msgIndex, result);
    // await new Promise(resolve => setTimeout(resolve, 100)); // chance for UI to propagate
  }
}

async function listenForTags() {
  console.info('Looking for a Portal...');

  while (keepReading) {
    try {
      if (Platform.OS === 'android') {
        await NfcManager.registerTagEvent();
      }
      await NfcManager.requestTechnology(NfcTech.NfcA, {});
      await manageTag();
    } catch (ex) {
      console.warn('Oops!', ex);
      alreadyInited = false;
      throw ex;
    } finally {
      // stopReading();
    }
    // await new Promise((resolve) => setTimeout(resolve, 100)); // chance for UI to propagate
  }
}

export const init = () => {
  console.log('INITIALIZING PORTAL NFC');
  if (alreadyInited) return;

  return NfcManager.isSupported().then((value) => {
    if (value) {
      console.log('NFC read starting...');
      NfcManager.start();
      alreadyInited = true;
      keepReading = true;
      listenForTags();
    } else {
      throw 'NFC not supported';
    }
  });
};

export const startReading = () => {
  if (!alreadyInited) return init();

  if (keepReading) return; // protect from double calls

  keepReading = true;
  return listenForTags();
};

export const stopReading = () => {
  console.log('stopReading');
  keepReading = false;
  alreadyInited = false;
  clearTimeout(livenessCheckInterval);
  NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
  // return NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
};

export const getStatus = async (): Promise<CardStatus> => {
  console.log('Called get status ');
  return sdk.getStatus();
};

export const unlock = async (pass: string) => {
  return sdk.unlock(pass);
};

export const publicDescriptors = async () => {
  console.log('Called descriptio');
  return sdk.publicDescriptors();
};

export const isReading = () => {
  return keepReading;
};

export const getPortalDetailsFromDescriptor = (descriptor: string) => {
  console.log('🚀 ~ getPortalDetailsFromDescriptor ~ descriptor:', descriptor);
  // Regular expression to extract the fingerprint, BIP32 path, and xpub
  const regex = /\[([0-9a-fA-F]+)\/([0-9'\/]+)\]([xtyz][A-Za-z0-9]+)/;
  //  /^\[(\w+\/(?:\d+'?\/)*\d+')\](tpub[a-zA-Z0-9]+)$/; // single sig
  const match = descriptor.match(regex);
  console.log('🚀 ~ getPortalDetailsFromDescriptor ~ match:', match);
  if (match) {
    const xpubDetails: XpubDetailsType = {};
    // SingleSig
    // const mfp = match[1].split('/')[0].replace('[', '');
    // const derivationPath = match[1]; // The full BIP-32 derivation path
    // const xpub = match[2]; // The extended public key (xpub)
    // xpubDetails[XpubTypes.P2WPKH] = { xpub, derivationPath };

    // Multisig
    const mfp = match[1].toUpperCase();
    const derivationPath = 'm/' + match[2];
    const xpub = match[3];
    xpubDetails[XpubTypes.P2WSH] = { xpub, derivationPath };

    return { xpub, derivationPath, masterFingerprint: mfp, xpubDetails };
  } else {
    throw new Error('Invalid descriptor format');
  }
};

export const initializePortal = (words: MnemonicWords, network: Network, pair_code?: string) => {
  return sdk.generateMnemonic(words, network, pair_code);
};

export const signPSBT = (psbt: string) => {
  return sdk.signPsbt(psbt);
};

export const getXpub = (derivationPath: string) => {
  return sdk.getXpub(derivationPath);
};

export const registerVault = (descriptor: string) => {
  return sdk.setDescriptor(descriptor);
};
