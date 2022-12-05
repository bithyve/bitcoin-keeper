import { EntityKind, SignerStorage, SignerType } from 'src/core/wallets/enums';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import config, { APP_STAGE } from 'src/core/config';

import NFC from 'src/core/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import { generateSignerFromMetaData, getWalletConfig } from '..';

export const registerToColcard = async ({ vault }: { vault: Vault }) => {
  const config = getWalletConfig({ vault });
  const enc = NFC.encodeForColdCard(config);
  await NFC.send(NfcTech.Ndef, enc);
};

export const getCCGenericJSON = async () => {
  const packet = await NFC.read(NfcTech.NfcV);
  const { xpub, deriv } = packet[0].data.bip84;
  return { xpub, derivationPath: deriv, xfp: packet[0].data.xfp };
};

export const getColdcardDetails = async () => {
  const { data, rtdName } = (await NFC.read(NfcTech.NfcV))[0];
  const xpub = rtdName === 'URI' || rtdName === 'TEXT' ? data : data.p2wsh;
  const derivationPath = data?.p2wsh_deriv ?? '';
  const xfp = data?.xfp ?? '';
  return { xpub, derivationPath, xfp };
};

export const getMockColdcardDetails = () => {
  if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
    const networkType = config.NETWORK_TYPE;
    const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKeyForSigner(
      EntityKind.VAULT,
      SignerType.COLDCARD,
      networkType
    );

    const cc: VaultSigner = generateSignerFromMetaData({
      xpub,
      xpriv,
      derivationPath,
      xfp: masterFingerprint,
      signerType: SignerType.COLDCARD,
      storageType: SignerStorage.COLD,
      isMock: true,
    });

    return cc;
  }
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
