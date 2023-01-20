import { Vault } from 'src/core/wallets/interfaces/vault';

import NFC from 'src/core/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { HWErrorType } from 'src/common/data/enums/Hardware';
import { getWalletConfig } from '..';
import HWError from '../HWErrorState';

export const registerToColcard = async ({ vault }: { vault: Vault }) => {
  const config = getWalletConfig({ vault });
  const enc = NFC.encodeForColdCard(config);
  await NFC.send(NfcTech.Ndef, enc);
};

export const extractColdCardExport = (data, rtdName) => {
  try {
    const xpub = rtdName === 'URI' || rtdName === 'TEXT' ? data : data.p2wsh;
    const derivationPath = data?.p2wsh_deriv ?? '';
    const xfp = data?.xfp ?? '';
    return { xpub, derivationPath, xfp, forMultiSig: true, forSingleSig: false };
  } catch (_) {
    console.log('Not exported for multisig!');
  }

  try {
    const { bip84 } = data;
    const { deriv } = bip84;
    const { xpub } = bip84;
    return { xpub, derivationPath: deriv, xfp: data.xfp, forMultiSig: false, forSingleSig: true };
  } catch (_) {
    console.log('Not exported for singlesig!');
    throw new HWError(HWErrorType.INCORRECT_HW);
  }
};

export const getColdcardDetails = async () => {
  const { data, rtdName } = (await NFC.read(NfcTech.NfcV))[0];
  return extractColdCardExport(data, rtdName);
};

export const signWithColdCard = async (message) => {
  const psbtBytes = NFC.encodeForColdCard(message);
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
