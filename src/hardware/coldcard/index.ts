import { Vault, XpubDetailsType } from 'src/services/wallets/interfaces/vault';

import NFC from 'src/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { HWErrorType } from 'src/models/enums/Hardware';
import { XpubTypes } from 'src/services/wallets/enums';
import { getWalletConfig } from '..';
import HWError from '../HWErrorState';

export const registerToColcard = async ({ vault }: { vault: Vault }) => {
  const config = getWalletConfig({ vault });
  const enc = NFC.encodeTextRecord(config);
  await NFC.send(NfcTech.Ndef, enc);
};

export const extractColdCardExport = (data, isMultisig) => {
  const xpubDetails: XpubDetailsType = {};
  const { bip84, bip48_2: bip48 } = data;
  const { deriv: singleSigPath } = bip84;
  const { xpub: singleSigXpub } = bip84;
  const { deriv: multiSigPath } = bip48;
  const { xpub: multiSigXpub } = bip48;
  xpubDetails[XpubTypes.P2WPKH] = { xpub: singleSigXpub, derivationPath: singleSigPath };
  xpubDetails[XpubTypes.P2WSH] = { xpub: multiSigXpub, derivationPath: multiSigPath };
  const xpub = isMultisig ? multiSigXpub : singleSigXpub;
  const derivationPath = isMultisig ? multiSigPath : singleSigPath;
  return { xpub, derivationPath, masterFingerprint: data.xfp, xpubDetails };
};

export const getConfigDetails = async () => {
  const { data } = (await NFC.read(NfcTech.NfcV))[0];
  return data;
};

export const getColdcardDetails = async (isMultisig: boolean) => {
  try {
    const { data } = (await NFC.read(NfcTech.NfcV))[0];
    return extractColdCardExport(data, isMultisig);
  } catch (_) {
    if (_.toString() === 'Error') {
      throw _;
    }
    throw new HWError(HWErrorType.INCORRECT_HW);
  }
};

export const signWithColdCard = async (message) => {
  const psbtBytes = NFC.encodeTextRecord(message);
  return NFC.send([NfcTech.Ndef], psbtBytes);
};

export const receivePSBTFromColdCard = async () => {
  const signedData = await NFC.read(NfcTech.NfcV);
  const payload = {
    name: '',
    signature: '',
    psbt: '',
  };
  signedData.forEach((record) => {
    if (record.data === 'Partly signed PSBT') {
      payload.name = record.data;
    } else if (record.data.length === 44) {
      // signature is of length 64 but 44 when base64 encoded
      payload.signature = record.data;
    } else {
      payload.psbt = record.data;
    }
  });
  return payload;
};

export const receiveTxHexFromColdCard = async () => {
  const signedData = await NFC.read(NfcTech.NfcV);
  const payload = {
    txid: '',
    txn: '',
  };
  signedData.forEach((packet) => {
    if (packet.rtdName === 'bitcoin.org:txid') {
      payload.txid = packet.data;
    } else if (packet.rtdName === 'bitcoin.org:txn') {
      payload.txn = Buffer.from(packet.data, 'base64').toString('hex');
    } else {
      // ignore
    }
  });
  return payload;
};
