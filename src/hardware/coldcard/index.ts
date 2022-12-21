import { EntityKind, SignerStorage, SignerType } from 'src/core/wallets/enums';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import config, { APP_STAGE } from 'src/core/config';

import NFC from 'src/core/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { generateSignerFromMetaData, getWalletConfig } from '..';

export const registerToColcard = async ({ vault }: { vault: Vault }) => {
  const config = getWalletConfig({ vault });
  const enc = NFC.encodeForColdCard(config);
  await NFC.send(NfcTech.Ndef, enc);
};

export const getColdcardDetails = async () => {
  const { data, rtdName } = (await NFC.read(NfcTech.NfcV))[0];
  try {
    let xpub = rtdName === 'URI' || rtdName === 'TEXT' ? data : data.p2wsh;
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
    const derivationPath = data?.p2wsh_deriv ?? '';
    const xfp = data?.xfp ?? '';
    return { xpub, derivationPath, xfp, forMultiSig: true, forSingleSig: false };
  } catch (_) {
    console.log('Not exported for multisig!');
  }

  try {
    const { bip84 } = data;
    const { deriv } = bip84;
    let { xpub } = bip84;
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
    return { xpub, derivationPath: deriv, xfp: data.xfp, forMultiSig: false, forSingleSig: true };
  } catch (_) {
    console.log('Not exported for singlesig!');
    throw new Error('IncorrectDevice: Please scan from the instructed secion of the coldcard');
  }
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
  return null;
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
