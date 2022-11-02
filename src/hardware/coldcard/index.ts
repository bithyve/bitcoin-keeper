import NFC from 'src/core/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { Vault } from 'src/core/wallets/interfaces/vault';

export const registerToColcard = async ({ vault }: { vault: Vault }) => {
  let line = '# Coldcard Multisig setup file (exported from Keeper)\n';
  line += `Name: Keeper Vault\n`;
  line += `Policy: ${vault.scheme.m} of ${vault.scheme.n}\n`;
  line += `Format: P2SH-P2WSH\n`;
  line += `\n`;
  vault.signers.forEach((signer) => {
    line += `Derivation: ${signer.xpubInfo.derivationPath}\n`;
    line += `${signer.xpubInfo.xfp}: ${signer.xpub}\n\n`;
  });
  const enc = NFC.encodeForColdCard(line);
  await NFC.send(NfcTech.Ndef, enc);
};

export const getCCGenericJSON = async () => {
  const packet = await NFC.read(NfcTech.NfcV);
  const { xpub, deriv } = packet[0].data.bip84;
  return { xpub, deriv, xfp: packet[0].data.xfp };
};

export const getCCxPubForMultisig = async () => {
  const { data, rtdName } = (await NFC.read(NfcTech.NfcV))[0];
  const xpub = rtdName === 'URI' ? data : rtdName === 'TEXT' ? data : data.p2sh_p2wsh;
  const path = data?.p2sh_p2wsh_deriv ?? '';
  const xfp = data?.xfp ?? '';
  return { xpub, path, xfp };
};
