import { Alert } from 'react-native';
import { CKTapCard } from 'cktap-protocol-react-native';
import { captureError } from 'src/core/services/sentry';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { ScriptTypes, XpubTypes } from 'src/core/wallets/enums';
import { XpubDetailsType } from 'src/core/wallets/interfaces/vault';

const getScriptSpecificDetails = async (card, cvc, isMultisig) => {
  const xpubDetails: XpubDetailsType = {};
  // fetch P2WPKH details
  const singleSigPath = WalletUtilities.getDerivationForScriptType(ScriptTypes.P2WPKH);
  await card.set_derivation(singleSigPath.split("'").join('h'), cvc);
  const singleSigXpub = await card.get_xpub(cvc);
  xpubDetails[XpubTypes.P2WPKH] = { xpub: singleSigXpub, derivationPath: singleSigPath };
  // fetch P2WSH details
  const multiSigPath = WalletUtilities.getDerivationForScriptType(ScriptTypes.P2WSH);
  await card.set_derivation(multiSigPath.split("'").join('h'), cvc);
  const multiSigXpub = await card.get_xpub(cvc);
  xpubDetails[XpubTypes.P2WSH] = { xpub: multiSigXpub, derivationPath: multiSigPath };
  // fetch masterfingerprint
  const xfp = await card.get_xfp(cvc);
  const xpub = isMultisig ? multiSigXpub : singleSigXpub;
  const derivationPath = isMultisig ? multiSigPath : singleSigPath;
  return { xpub, xfp: xfp.toString('hex'), derivationPath, xpubDetails };
};

export const getTapsignerDetails = async (card: CKTapCard, cvc: string, isMultisig: boolean) => {
  const status = await card.first_look();
  const isLegit = await card.certificate_check();
  if (isLegit) {
    if (status.path) {
      const { xpub, xfp, derivationPath, xpubDetails } = await getScriptSpecificDetails(
        card,
        cvc,
        isMultisig
      );
      // reset to original path
      await card.set_derivation(status.path, cvc);
      return { xpub, xfp, derivationPath, xpubDetails };
    }
    await card.setup(cvc);
    const newCard = await card.first_look();
    const { xpub, xfp, derivationPath, xpubDetails } = await getScriptSpecificDetails(
      newCard,
      cvc,
      isMultisig
    );
    // reset to original path
    await card.set_derivation(status.path, cvc);
    return { xpub, xfp, derivationPath, xpubDetails };
  }
};

export const signWithTapsigner = async (
  card: CKTapCard,
  inputsToSign: {
    digest: string;
    subPath: string;
    inputIndex: number;
    sighashType: number;
    publicKey: string;
    signature?: string;
  }[],
  cvc
) => {
  try {
    const status = await card.first_look();
    if (status.path) {
      // eslint-disable-next-line no-restricted-syntax
      for (const input of inputsToSign) {
        const digest = Buffer.from(input.digest, 'hex');
        const subpath = input.subPath;
        // eslint-disable-next-line no-await-in-loop
        const signature = await card.sign_digest(cvc, 0, digest, subpath);
        input.signature = signature.slice(1).toString('hex');
      }
      return inputsToSign;
    }
    Alert.alert('Please setup card before signing!');
  } catch (e) {
    captureError(e);
  }
};

export const readTapsigner = async (card: CKTapCard, cvc: string) => {
  await card.first_look();
  await card.read(cvc);
};
