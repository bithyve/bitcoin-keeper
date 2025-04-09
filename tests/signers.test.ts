import {
  JADE_MS_EXPORT,
  JADE_SS_EXPORT,
  KEYSTONE_MS_EXPORT,
  KEYSTONE_SS_EXPORT,
  PASSPORT_MS_EXPORT,
  PASSPORT_SS_EXPORT,
  SEEDSIGNER_MS_EXPORT,
  SEEDSIGNER_SS_EXPORT,
  COLDCARD_EXPORT,
  SPECTER_MS_EXPORT,
  SPECTER_SS_EXPORT,
  MOBILE_KEY_EXPORT,
  KEEPER_EXTERNAL_EXPORT,
  SEED_WORDS_EXPORT,
  BITBOX02_EXPORT,
  TREZOR_EXPORT,
  LEDGER_EXPORT,
  KEEPER_INTERNAL_EXPORT,
} from './signingDeviceExportFormats';

import {
  setupJade,
  setupKeystone,
  setupPassport,
  setupSeedSigner,
  setupColdcard,
  setupSpecter,
  setupMobileKey,
  setupKeeperSigner,
  setupSeedWordsBasedKey,
  setupBitbox,
  setupLedger,
  setupTrezor,
} from 'src/hardware/signerSetup';

import { URRegistryDecoder } from 'src/services/qr/bc-ur-registry';
import { decodeURBytes } from 'src/services/qr';
import { SignerType, XpubTypes } from 'src/services/wallets/enums';
import { getSignerNameFromType } from 'src/hardware';
import { getCosignerDetails } from 'src/services/wallets/factories/WalletFactory';

// TODO: Add more tests for the other signers

// TAPSIGNER = 'TAPSIGNER',
// POLICY_SERVER = 'POLICY_SERVER',
// OTHER_SD = 'OTHER_SD',
// UNKOWN_SIGNER = 'UNKNOWN_SIGNER',

jest.setTimeout(20000);
type RotatingQR = {
  data: string;
}[];
const extractDataFromRotatingQR = (rotatingQrData: RotatingQR) => {
  const decoder = new URRegistryDecoder();

  if (rotatingQrData.length === 1) {
    const { data } = decodeURBytes(decoder, rotatingQrData[0].data);
    return data;
  }

  const extractedData = rotatingQrData.reduce((extractedData, item) => {
    const { percentage, data } = decodeURBytes(decoder, item.data);
    return percentage === 100 ? data : extractedData;
  }, null);

  return extractedData;
};

describe('Signing Devices: setup flow with sample singlesig data', () => {
  // Function to test setup flow
  const testSetupFlow = (extractFunction, setupFunction, type, extractProperties) => {
    test(`${getSignerNameFromType(
      type
    )}: should generate a signer and key with expected properties`, async () => {
      // Extract data from QR
      const qrExtract = extractFunction();

      // Assert extracted properties
      for (const prop of extractProperties) {
        expect(qrExtract).toHaveProperty(prop);
      }

      // Setup signer and key
      const { signer, key } = await setupFunction(qrExtract, false);

      // Assert signer properties
      expect(signer).toHaveProperty('signerXpubs');
      expect(signer.type).toEqual(type);
      expect(signer.signerXpubs[XpubTypes.P2WPKH][0]).toHaveProperty('xpub');
      expect(signer.signerXpubs[XpubTypes.P2WPKH][0]).toHaveProperty('derivationPath');

      // Assert key properties
      expect(key).toHaveProperty('xpub');
      expect(key).toHaveProperty('derivationPath');
      expect(key).toHaveProperty('masterFingerprint');
      expect(key).toHaveProperty('xfp');
    });
  };

  // Define QR data extraction functions and corresponding setup functions
  const devices = [
    {
      extract: () => extractDataFromRotatingQR(JADE_SS_EXPORT),
      setup: setupJade,
      type: SignerType.JADE,
      properties: ['mfp', 'derivationPath', 'xPub'],
    },
    {
      extract: () => extractDataFromRotatingQR([KEYSTONE_SS_EXPORT]),
      setup: setupKeystone,
      type: SignerType.KEYSTONE,
      properties: ['mfp', 'derivationPath', 'xPub'],
    },
    {
      extract: () => extractDataFromRotatingQR(PASSPORT_SS_EXPORT),
      setup: setupPassport,
      type: SignerType.PASSPORT,
      properties: ['bip84', 'xfp', 'bip84.xpub', 'bip84.deriv'],
    },
    {
      extract: () => SEEDSIGNER_SS_EXPORT.data,
      setup: setupSeedSigner,
      type: SignerType.SEEDSIGNER,
      properties: [],
    },
    {
      extract: () => SPECTER_SS_EXPORT.data,
      setup: setupSpecter,
      type: SignerType.SPECTER,
      properties: [],
    },
    {
      extract: () => COLDCARD_EXPORT.data,
      setup: setupColdcard,
      type: SignerType.COLDCARD,
      properties: [],
    },
    {
      extract: () => ({ primaryMnemonic: MOBILE_KEY_EXPORT, isMultisig: false }),
      setup: setupMobileKey,
      type: SignerType.MOBILE_KEY,
      properties: [],
    },
    {
      extract: () => SEED_WORDS_EXPORT,
      setup: setupSeedWordsBasedKey,
      type: SignerType.SEED_WORDS,
      properties: [],
    },
    {
      extract: () => BITBOX02_EXPORT,
      setup: setupBitbox,
      type: SignerType.BITBOX02,
      properties: [],
    },
    {
      extract: () => TREZOR_EXPORT,
      setup: setupTrezor,
      type: SignerType.TREZOR,
      properties: [],
    },
    {
      extract: () => LEDGER_EXPORT,
      setup: setupLedger,
      type: SignerType.LEDGER,
      properties: [],
    },
  ];

  // Test setup flow for each device
  devices.forEach((device) => {
    testSetupFlow(device.extract, device.setup, device.type, device.properties);
  });
});

describe('Signing Devices: setup flow with sample multisig data', () => {
  // Function to test setup flow
  const testSetupFlow = (extractFunction, setupFunction, type, extractProperties) => {
    test(`${getSignerNameFromType(
      type
    )}: should generate a signer and key with expected properties`, async () => {
      // Extract data from QR
      const qrExtract = await extractFunction();

      // Assert extracted properties
      for (const prop of extractProperties) {
        expect(qrExtract).toHaveProperty(prop);
      }

      // Setup signer and key
      const { signer, key } = await setupFunction(qrExtract, true);

      // Assert signer properties
      expect(signer).toHaveProperty('signerXpubs');
      expect(signer.type).toEqual(type);
      expect(signer.signerXpubs[XpubTypes.P2WSH][0]).toHaveProperty('xpub');
      expect(signer.signerXpubs[XpubTypes.P2WSH][0]).toHaveProperty('derivationPath');

      // Assert key properties
      expect(key).toHaveProperty('xpub');
      expect(key).toHaveProperty('derivationPath');
      expect(key).toHaveProperty('masterFingerprint');
      expect(key).toHaveProperty('xfp');
    });
  };

  // Define QR data extraction functions and corresponding setup functions
  const devices = [
    {
      extract: () => extractDataFromRotatingQR(JADE_MS_EXPORT),
      setup: setupJade,
      type: SignerType.JADE,
      properties: ['mfp', 'derivationPath', 'xPub'],
    },
    {
      extract: () => extractDataFromRotatingQR([KEYSTONE_MS_EXPORT]),
      setup: setupKeystone,
      type: SignerType.KEYSTONE,
      properties: ['mfp', 'derivationPath', 'xPub'],
    },
    {
      extract: () => extractDataFromRotatingQR(PASSPORT_MS_EXPORT),
      setup: setupPassport,
      type: SignerType.PASSPORT,
      properties: ['p2wsh', 'p2wsh_deriv', 'xfp'],
    },
    {
      extract: () => SEEDSIGNER_MS_EXPORT.data,
      setup: setupSeedSigner,
      type: SignerType.SEEDSIGNER,
      properties: [],
    },
    {
      extract: () => SPECTER_MS_EXPORT.data,
      setup: setupSpecter,
      type: SignerType.SPECTER,
      properties: [],
    },
    {
      extract: () => COLDCARD_EXPORT.data,
      setup: setupColdcard,
      type: SignerType.COLDCARD,
      properties: [],
    },
    {
      extract: () => ({ primaryMnemonic: MOBILE_KEY_EXPORT, isMultisig: true }),
      setup: setupMobileKey,
      type: SignerType.MOBILE_KEY,
      properties: [],
    },
    {
      extract: () => KEEPER_EXTERNAL_EXPORT.data,
      setup: setupKeeperSigner,
      type: SignerType.KEEPER,
      properties: [],
    },
    {
      extract: () => getCosignerDetails(KEEPER_INTERNAL_EXPORT, 1),
      setup: setupKeeperSigner,
      type: SignerType.MY_KEEPER,
      properties: [
        'xpubDetails',
        'xpubDetails.P2WSH',
        'xpubDetails.P2WSH.xpub',
        'xpubDetails.P2WSH.derivationPath',
        'xpubDetails.P2WSH.xpriv',
        'mfp',
      ],
    },
    {
      extract: () => SEED_WORDS_EXPORT,
      setup: setupSeedWordsBasedKey,
      type: SignerType.SEED_WORDS,
      properties: [],
    },
    {
      extract: () => BITBOX02_EXPORT,
      setup: setupBitbox,
      type: SignerType.BITBOX02,
      properties: [],
    },
    {
      extract: () => TREZOR_EXPORT,
      setup: setupTrezor,
      type: SignerType.TREZOR,
      properties: [],
    },
    {
      extract: () => LEDGER_EXPORT,
      setup: setupLedger,
      type: SignerType.LEDGER,
      properties: [],
    },
  ];

  // Test setup flow for each device
  devices.forEach((device) => {
    testSetupFlow(device.extract, device.setup, device.type, device.properties);
  });
});
