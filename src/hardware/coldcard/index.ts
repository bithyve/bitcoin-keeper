import { EntityKind, SignerStorage, SignerType } from 'src/core/wallets/enums';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import config, { APP_STAGE } from 'src/core/config';
import { generateSignerFromMetaData, getWalletConfig } from '..';

import NFC from 'src/core/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';

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
