import { EntityKind, SignerStorage, SignerType } from 'src/core/wallets/enums';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import config, { APP_STAGE } from 'src/core/config';

import NFC from 'src/core/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import { generateSignerFromMetaData } from '..';

export const getWalletConfig = ({ vault }: { vault: Vault }) => {
  let line = '# Coldcard Multisig setup file (exported from Keeper)\n';
  line += `Name: Keeper Vault\n`;
  line += `Policy: ${vault.scheme.m} of ${vault.scheme.n}\n`;
  line += `Format: P2SH-P2WSH\n`;
  line += `\n`;
  vault.signers.forEach((signer) => {
    line += `Derivation: ${signer.xpubInfo.derivationPath}\n`;
    line += `${signer.xpubInfo.xfp}: ${signer.xpub}\n\n`;
  });
  return line;
};

export const registerToColcard = async ({ vault }: { vault: Vault }) => {
  const config = getWalletConfig({ vault });
  const enc = NFC.encodeForColdCard(config);
  console.log(config);
  await NFC.send(NfcTech.Ndef, enc);
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
