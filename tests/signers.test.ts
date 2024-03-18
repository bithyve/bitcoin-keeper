import {
  JADE_MS_EXPORT,
  //   COLDCARD_EXPORT,
  //   JADE_SS_EXPORT,
  //   KEYSTONE_MS_EXPORT,
  //   KEYSTONE_SS_EXPORT,
  //   PASSPORT_MS_EXPORT,
  //   PASSPORT_SS_EXPORT,
  //   SEEDSIGNER_MS_EXPORT,
  //   SEEDSIGNER_SS_EXPORT,
} from './signingDeviceExportFormats';

// import { SignerType } from 'src/core/wallets/enums';
import {
  setupJade,
  //   setupKeeperSigner,
  //   setupKeystone,
  //   setupMobileKey,
  //   setupPassport,
  //   setupSeedSigner,
  //   setupSeedWordsBasedKey,
  //   setupSpecter,
} from 'src/hardware/signerSetup';

import { URRegistryDecoder } from 'src/services/qr/bc-ur-registry';
import { decodeURBytes } from 'src/services/qr';
import { SignerType, XpubTypes } from 'src/core/wallets/enums';
// import { SignerStorage } from 'src/core/wallets/enums';

jest.setTimeout(20000);
type RotatingQR = {
  data: string;
}[];
const extractDataFromRotatingQR = (rotatingQrData: RotatingQR) => {
  const decoder = new URRegistryDecoder();

  const extractedData = rotatingQrData.reduce((extractedData, item) => {
    const { percentage, data } = decodeURBytes(decoder, item.data);
    return percentage === 100 ? data : extractedData;
  }, null);

  return extractedData;
};

describe('Signing Devices: setup flow with sample data', () => {
  // get all the signer types in an array from the enum
  const signerTypes = Object.values(SignerType);

  test('should generate a signer and key when given valid QR data and isMultisig is true and forMultiSig is true', () => {
    const jadeQrExtract = extractDataFromRotatingQR(JADE_MS_EXPORT);

    expect(jadeQrExtract).toHaveProperty('mfp');
    expect(jadeQrExtract).toHaveProperty('derivationPath');
    expect(jadeQrExtract).toHaveProperty('xPub');

    const { signer, key } = setupJade(jadeQrExtract, true);

    expect(signer).toHaveProperty('signerXpubs');
    expect(signer.type).toEqual(SignerType.JADE);
    expect(signer.signerXpubs[XpubTypes.P2WSH][0]).toHaveProperty('xpub');
    expect(signer.signerXpubs[XpubTypes.P2WSH][0]).toHaveProperty('derivationPath');

    expect(key).toHaveProperty('xpub');
    expect(key).toHaveProperty('derivationPath');
    expect(key).toHaveProperty('masterFingerprint');
    expect(key).toHaveProperty('xfp');
  });
});
