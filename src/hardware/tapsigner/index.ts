import { EntityKind, SignerStorage, SignerType } from 'src/core/wallets/enums';
import config, { APP_STAGE } from 'src/core/config';

import { Alert } from 'react-native';
import { CKTapCard } from 'cktap-protocol-react-native';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import { generateSignerFromMetaData } from '..';

export const getTapsignerDetails = async (card: CKTapCard, cvc: string) => {
  const status = await card.first_look();
  const isLegit = await card.certificate_check();
  if (isLegit) {
    if (status.path) {
      const xpub = await card.get_xpub(cvc);
      const xfp = await card.get_xfp(cvc);
      return { xpub, xfp: xfp.toString('hex'), derivationPath: status.path };
    } else {
      await card.setup(cvc);
      const newCard = await card.first_look();
      const xpub = await card.get_xpub(cvc);
      const xfp = await card.get_xfp(cvc);
      return { xpub, derivationPath: newCard.path, xfp: xfp.toString('hex') };
    }
  }
};

export const getMockTapsignerDetails = (amfData = null) => {
  if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
    const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKeyForSigner(
      EntityKind.VAULT,
      SignerType.TAPSIGNER,
      config.NETWORK_TYPE
    );

    const tapsigner: VaultSigner = generateSignerFromMetaData({
      xpub,
      xpriv,
      derivationPath,
      xfp: masterFingerprint,
      signerType: SignerType.TAPSIGNER,
      storageType: SignerStorage.COLD,
      isMock: true,
    });

    if (amfData) {
      tapsigner.amfData = amfData;
      tapsigner.signerName = 'TAPSIGNER*';
      tapsigner.isMock = false;
    }
    return tapsigner;
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
      for (const input of inputsToSign) {
        const digest = Buffer.from(input.digest, 'hex');
        const subpath = input.subPath;
        const signature = await card.sign_digest(cvc, 0, digest, subpath);
        input.signature = signature.slice(1).toString('hex');
      }
      return inputsToSign;
    } else {
      Alert.alert('Please setup card before signing!');
    }
  } catch (e) {
    console.log(e);
  }
};

export const readTapsigner = async (card: CKTapCard, cvc: string) => {
  await card.first_look();
  await card.read(cvc);
};
