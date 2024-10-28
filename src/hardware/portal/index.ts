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
  // while (keepReading) {
  console.info('Looking for a Portal...');

  try {
    await NfcManager.registerTagEvent();
    await NfcManager.requestTechnology(NfcTech.NfcA, {});
    await manageTag();
  } catch (ex) {
    console.warn('Oops!', ex);
    throw ex;
  } finally {
    await NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
  }

  // await new Promise(resolve => setTimeout(resolve, 100)); // chance for UI to propagate
  // }
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
  console.log('startReading ');
  if (!alreadyInited) return init();

  if (keepReading) return; // protect from double calls

  keepReading = true;
  return listenForTags();
};

export const stopReading = () => {
  console.log('stopReading');
  keepReading = false;
  clearTimeout(livenessCheckInterval);
  NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
  // return NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
};

export const getStatus = async (): Promise<CardStatus> => {
  // if (!keepReading) throw new Error('getStatus(): not reading');
  console.log('Called get status ');
  return sdk.getStatus();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 2_000);

    sdk.getStatus().then((result: CardStatus) => {
      clearTimeout(timeout);
      resolve(result);
    });
  });
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
  // const regex = /^\[(\w+\/(?:\d+'?\/)*\d+')\]([xt]pub[a-zA-Z0-9]+)$/; // multisig test/mainnet
  //  /^\[(\w+\/(?:\d+'?\/)*\d+')\](tpub[a-zA-Z0-9]+)$/; // single sig
  // /^\[([0-9a-fA-F]+)\/([0-9]+'?\/[0-9]+'?\/[0-9]+'?\/[0-9]+'?)\](tpub[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+)$/; // multisig testnet
  const match = descriptor.match(regex);
  console.log('🚀 ~ getPortalDetailsFromDescriptor ~ match:', match);
  if (match) {
    const xpubDetails: XpubDetailsType = {};
    // SingleSig
    // const mfp = match[1].split('/')[0].replace('[', '');
    // const derivationPath = match[1]; // The full BIP-32 derivation path
    // const xpub = match[2]; // The extended public key (xpub)
    // xpubDetails[XpubTypes.P2WPKH] = { xpub, derivationPath };

    // Multi
    // const mfp = match[1].split('/')[0].replace('[', '');
    // const derivationPath = match[1]; // The full BIP-32 derivation path
    // const xpub = match[2]; // The extended public key (xpub/tpub)
    // xpubDetails[XpubTypes.P2WSH] = { xpub, derivationPath };

    // NEW
    const mfp = match[1].toUpperCase();
    const derivationPath = 'm/' + match[2];
    const xpub = match[3];
    xpubDetails[XpubTypes.P2WSH] = { xpub, derivationPath };

    console.log('🚀xpubDetails:', { xpub, derivationPath, masterFingerprint: mfp, xpubDetails });
    return { xpub, derivationPath, masterFingerprint: mfp, xpubDetails };
  } else {
    throw new Error('Invalid descriptor format');
  }
};

export const initializePortal = (words: MnemonicWords, network: Network, pair_code?: string) => {
  console.log('🚀 ~ initializePortal ~ network:', network);
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
