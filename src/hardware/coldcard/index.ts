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
  console.log(line);
  await NFC.send(NfcTech.Ndef, enc);
};
