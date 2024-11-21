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
import { isTestnet } from 'src/constants/Bitcoin';

let sdk = new PortalSdk(true);
let keepReading = false;
let alreadyInitiated = false;
let livenessCheckInterval: NodeJS.Timeout;
let paused = false;

function livenessCheck(): Promise<NfcOut> {
  return new Promise((_resolve, reject) => {
    const interval = setInterval(() => {
      if (paused) {
        return;
      }

      NfcManager.getTag()
        .then(() => NfcManager.transceive([0x30, 0xed]))
        .catch(() => {
          NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
          clearInterval(interval);
          alreadyInitiated = false;
          keepReading = false;
          reject('Removed tag');
        });
    }, 250);
  });
}

async function manageTag() {
  await sdk.newTag();
  const check = Platform.select({
    ios: () => new Promise(() => {}),
    android: () => livenessCheck(),
  })();

  while (keepReading) {
    const msg = await Promise.race([sdk.poll(), check]);
    // console.trace('>', msg.data);
    if (!paused) {
      const result = await NfcManager.nfcAHandler.transceive(msg.data);
      // console.trace('<', result);
      await sdk.incomingData(msg.msgIndex, result);
    }
  }
}

async function restartPolling() {
  const timeout = new Promise((_, rej) => setTimeout(rej, 250));

  paused = true;
  return Promise.race([NfcManager.restartTechnologyRequestIOS(), timeout]).finally(() => {
    paused = false;
  });
}

async function getOneTag() {
  paused = false;
  let restartInterval = null;

  if (Platform.OS === 'android') {
    await NfcManager.registerTagEvent();
  }
  await NfcManager.requestTechnology(NfcTech.NfcA, {}).catch(() => {
    stopReading();
  });
  if (Platform.OS === 'ios') {
    restartInterval = setInterval(restartPolling, 17500);
  }

  while (keepReading) {
    try {
      await manageTag();
    } catch (ex) {
      alreadyInitiated = false;
      keepReading = false;
      paused = true;
    }

    // Try recovering the tag on iOS
    if (Platform.OS === 'ios') {
      try {
        await restartPolling();
      } catch (_ex) {
        if (restartInterval) {
          clearInterval(restartInterval);
        }

        NfcManager.invalidateSessionWithErrorIOS('Portal was lost');
        alreadyInitiated = false;
        keepReading = false;
        break;
      }
    } else {
      NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
      break;
    }
  }
}

async function listenForTags() {
  while (keepReading) {
    await getOneTag();
  }
}

export const init = () => {
  if (alreadyInitiated) return;

  return NfcManager.isSupported().then((value) => {
    if (value) {
      sdk ??= new PortalSdk(true);
      NfcManager.start();
      alreadyInitiated = true;
      keepReading = true;
      listenForTags();
    } else {
      throw 'NFC not supported';
    }
  });
};

export const startReading = () => {
  try {
    if (!alreadyInitiated) return init();

    if (keepReading) return; // protect from double calls

    keepReading = true;
    return listenForTags();
  } catch (error) {}
};

export const stopReading = () => {
  keepReading = false;
  alreadyInitiated = false;
  paused = false;
  clearTimeout(livenessCheckInterval);
  NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
  sdk = null;
  // return NfcManager.cancelTechnologyRequest({ delayMsAndroid: 0 });
};

export const getStatus = async (): Promise<CardStatus> => {
  const status = await sdk.getStatus();
  return status;
};

export const unlock = async (pass: string) => {
  return sdk.unlock(pass);
};

export const publicDescriptors = async () => {
  return sdk.publicDescriptors();
};

export const isReading = () => {
  return keepReading;
};

export const getPortalDetailsFromDescriptor = (descriptor: string) => {
  const regex = /\[([0-9a-fA-F]+)\/([0-9'\/]+)\]([xtyz][A-Za-z0-9]+)/;
  //  /^\[(\w+\/(?:\d+'?\/)*\d+')\](tpub[a-zA-Z0-9]+)$/; // single sig
  const match = descriptor.match(regex);
  if (match) {
    const xpubDetails: XpubDetailsType = {};
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

export const getXpub = ({ isMultisig = true }) => {
  const derivationPath = isMultisig
    ? isTestnet()
      ? 'm/48h/1h/0h/2h'
      : 'm/48h/0h/0h/2h'
    : isTestnet()
    ? 'm/84h/0h/0h'
    : 'm/84h/1h/0h';
  return sdk.getXpub(derivationPath);
};

export const registerVault = (descriptor: string) => {
  return sdk.setDescriptor(descriptor, null);
};

export const wipePortal = () => {
  return sdk.debugWipeDevice();
};

export const resumeMnemonicGeneration = () => {
  return sdk.resume();
};

export const verifyAddress = (addressIndex: number) => {
  return sdk.displayAddress(addressIndex);
};

export const PORTAL_ERRORS = {
  INCORRECT_PIN: 'Incorrect Pin. Please try again',
  PORTAL_LOCKED: 'Portal is locked. Pin is required',
  PORTAL_NOT_INITIALIZED: 'Portal not initialized',
  CVC_MISMATCH: 'CVC does not match',
  UNVERIFIED_MNEMONIC: 'Unverified mnemonic',
};