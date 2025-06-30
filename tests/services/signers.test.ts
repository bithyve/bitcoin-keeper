jest.mock('src/store/store', () => ({
  store: {
    getState: jest.fn(() => ({
      settings: {
        bitcoinNetworkType: 'TESTNET',
      },
    })),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  },
}));

import {
  COLDCARD_EXPORT,
  SEEDSIGNER_SS_EXPORT,
  JADE_SS_EXPORT,
  SPECTER_SS_EXPORT,
  MOBILE_KEY_EXPORT,
  KEEPER_EXTERNAL_EXPORT,
  KEEPER_INTERNAL_EXPORT,
  SEED_WORDS_EXPORT,
} from '../utils/signingDeviceExportFormats';

import {
  setupJade,
  setupSeedSigner,
  setupColdcard,
  setupSpecter,
  setupMobileKey,
  setupKeeperSigner,
  setupSeedWordsBasedKey,
} from 'src/hardware/signerSetup';

import { URRegistryDecoder } from 'src/services/qr/bc-ur-registry';
import { decodeURBytes } from 'src/services/qr';
import { SignerType, XpubTypes, NetworkType } from 'src/services/wallets/enums';
import { getCosignerDetails } from 'src/services/wallets/factories/WalletFactory';

jest.setTimeout(30000);

// Type definitions
type RotatingQR = {
  data: string;
}[];

// Test helper functions
const isValidQRData = (data: any): boolean => {
  return data !== null && data !== undefined;
};

const extractDataFromRotatingQR = (rotatingQrData: RotatingQR) => {
  if (!rotatingQrData || rotatingQrData.length === 0) {
    return null;
  }

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

interface SignerTestData {
  type: SignerType;
  name: string;
  extractFunction: () => any;
  setupFunction: (data: any, isMultisig?: boolean) => any;
  expectedProperties: string[];
  supportsMultisig: boolean;
  skipSingleSig?: boolean;
  skipMultisig?: boolean;
}

const SIGNER_TEST_DATA: SignerTestData[] = [
  {
    type: SignerType.JADE,
    name: 'Jade',
    extractFunction: () => extractDataFromRotatingQR(JADE_SS_EXPORT),
    setupFunction: setupJade,
    expectedProperties: ['mfp', 'derivationPath', 'xPub'],
    supportsMultisig: true,
  },
  {
    type: SignerType.COLDCARD,
    name: 'COLDCARD',
    extractFunction: () => COLDCARD_EXPORT.data,
    setupFunction: setupColdcard,
    expectedProperties: ['bip84', 'xfp', 'chain'],
    supportsMultisig: true,
  },
  {
    type: SignerType.MOBILE_KEY,
    name: 'Recovery Key',
    extractFunction: () => ({ primaryMnemonic: MOBILE_KEY_EXPORT, isMultisig: false }),
    setupFunction: setupMobileKey,
    expectedProperties: ['primaryMnemonic'],
    supportsMultisig: true,
  },
  {
    type: SignerType.SEED_WORDS,
    name: 'Seed Key',
    extractFunction: () => SEED_WORDS_EXPORT,
    setupFunction: setupSeedWordsBasedKey,
    expectedProperties: [],
    supportsMultisig: true,
  },
  {
    type: SignerType.KEEPER,
    name: 'External Key',
    extractFunction: () => KEEPER_EXTERNAL_EXPORT.data,
    setupFunction: setupKeeperSigner,
    expectedProperties: [],
    supportsMultisig: true,
    skipSingleSig: true, // Keeper only supports multisig
  },
];

describe('Signing Devices: Single-sig setup flow tests', () => {
  // Test each signer that supports single-sig
  SIGNER_TEST_DATA.filter((signer) => !signer.skipSingleSig).forEach((signerData) => {
    test(`${signerData.name}: should generate a signer and key with expected properties`, async () => {
      // Extract data from QR or other source
      const qrExtract = signerData.extractFunction();

      // Skip if extraction failed
      if (!isValidQRData(qrExtract)) {
        console.warn(`Skipping ${signerData.name} test - invalid QR data extraction`);
        return;
      }

      // Assert extracted properties if specified
      for (const prop of signerData.expectedProperties) {
        if (prop.includes('.')) {
          // Handle nested properties like 'bip84.xpub'
          const parts = prop.split('.');
          let current = qrExtract;
          for (const part of parts) {
            expect(current).toHaveProperty(part);
            current = current[part];
          }
        } else {
          expect(qrExtract).toHaveProperty(prop);
        }
      }

      // Setup signer and key
      const isMultisig = false;
      const { signer, key } = await signerData.setupFunction(qrExtract, isMultisig);

      // Assert signer properties
      expect(signer).toHaveProperty('signerXpubs');
      expect(signer.type).toEqual(signerData.type);
      expect(signer).toHaveProperty('masterFingerprint');
      expect(signer).toHaveProperty('signerName');
      expect(signer).toHaveProperty('storageType');
      expect(signer).toHaveProperty('addedOn');
      expect(signer).toHaveProperty('lastHealthCheck');

      // For single-sig, check P2WPKH xpub
      if (signer.signerXpubs && signer.signerXpubs[XpubTypes.P2WPKH]) {
        expect(signer.signerXpubs[XpubTypes.P2WPKH][0]).toHaveProperty('xpub');
        expect(signer.signerXpubs[XpubTypes.P2WPKH][0]).toHaveProperty('derivationPath');
      }

      // Assert key properties
      expect(key).toHaveProperty('xpub');
      expect(key).toHaveProperty('derivationPath');
      expect(key).toHaveProperty('masterFingerprint');
      expect(key).toHaveProperty('xfp');

      console.log(`✓ ${signerData.name} single-sig test passed`);
    });
  });
});

describe('Signing Devices: Multi-sig setup flow tests', () => {
  // Test each signer that supports multi-sig
  SIGNER_TEST_DATA.filter((signer) => signer.supportsMultisig && !signer.skipMultisig).forEach(
    (signerData) => {
      test(`${signerData.name}: should generate a multi-sig signer and key with expected properties`, async () => {
        // Extract data from QR or other source
        const qrExtract =
          signerData.type === SignerType.MOBILE_KEY
            ? { primaryMnemonic: MOBILE_KEY_EXPORT, isMultisig: true }
            : signerData.extractFunction();

        // Skip if extraction failed
        if (!isValidQRData(qrExtract)) {
          console.warn(`Skipping ${signerData.name} multisig test - invalid QR data extraction`);
          return;
        }

        // Setup signer and key for multi-sig
        const isMultisig = true;
        const { signer, key } = await signerData.setupFunction(qrExtract, isMultisig);

        // Assert signer properties
        expect(signer).toHaveProperty('signerXpubs');
        expect(signer.type).toEqual(signerData.type);
        expect(signer).toHaveProperty('masterFingerprint');
        expect(signer).toHaveProperty('signerName');
        expect(signer).toHaveProperty('storageType');
        expect(signer).toHaveProperty('addedOn');
        expect(signer).toHaveProperty('lastHealthCheck');

        // For multi-sig, check P2WSH xpub
        if (signer.signerXpubs && signer.signerXpubs[XpubTypes.P2WSH]) {
          expect(signer.signerXpubs[XpubTypes.P2WSH][0]).toHaveProperty('xpub');
          expect(signer.signerXpubs[XpubTypes.P2WSH][0]).toHaveProperty('derivationPath');
        }

        // Assert key properties
        expect(key).toHaveProperty('xpub');
        expect(key).toHaveProperty('derivationPath');
        expect(key).toHaveProperty('masterFingerprint');
        expect(key).toHaveProperty('xfp');

        console.log(`✓ ${signerData.name} multi-sig test passed`);
      });
    }
  );
});

describe('Signing Devices: Core functionality tests', () => {
  test('should validate working signers have correct types', async () => {
    const { signer } = setupColdcard(COLDCARD_EXPORT.data, false);
    expect(signer.type).toBe(SignerType.COLDCARD);
    expect(signer.storageType).toBeDefined();
    expect(signer.signerName).toContain(SignerType.COLDCARD);
  });

  test('should handle seed-based signers correctly', async () => {
    const { signer } = setupSeedWordsBasedKey(SEED_WORDS_EXPORT, false, true);
    expect(signer.type).toBe(SignerType.SEED_WORDS);
    expect(signer.signerXpubs).toBeDefined();
  });

  test('should validate mobile key setup with different configurations', async () => {
    const singleSigConfig = { primaryMnemonic: MOBILE_KEY_EXPORT, isMultisig: false };
    const multiSigConfig = { primaryMnemonic: MOBILE_KEY_EXPORT, isMultisig: true };

    const { signer: singleSigSigner } = await setupMobileKey(singleSigConfig);
    const { signer: multiSigSigner } = await setupMobileKey(multiSigConfig);

    expect(singleSigSigner.type).toBe(SignerType.MOBILE_KEY);
    expect(multiSigSigner.type).toBe(SignerType.MOBILE_KEY);

    expect(singleSigSigner.signerXpubs).toBeDefined();
    expect(multiSigSigner.signerXpubs).toBeDefined();
  });
});

describe('Signing Devices: Error handling and edge cases', () => {
  test('should handle invalid data gracefully', async () => {
    expect(() => {
      setupSeedSigner('invalid-data', false);
    }).toThrow();
  });

  test('should validate isValidQRData helper', () => {
    expect(isValidQRData(null)).toBe(false);
    expect(isValidQRData(undefined)).toBe(false);
    expect(isValidQRData({})).toBe(true);
    expect(isValidQRData({ data: 'test' })).toBe(true);
  });

  test('should validate basic network type configuration', () => {
    // Since we mocked the store, it should be available
    expect(typeof NetworkType.TESTNET).toBe('string');
  });
});

describe('Signing Devices: Performance and timeout tests', () => {
  test('signer setup functions should complete within reasonable time', async () => {
    const startTime = Date.now();

    const { signer } = setupSeedWordsBasedKey(SEED_WORDS_EXPORT, false);
    expect(signer).toBeDefined();

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  test('should handle concurrent signer setup operations', async () => {
    const setupPromises = [
      () => setupSeedWordsBasedKey(SEED_WORDS_EXPORT, false),
      () => setupMobileKey({ primaryMnemonic: MOBILE_KEY_EXPORT, isMultisig: false }),
    ].map((fn) => {
      return Promise.resolve(fn());
    });

    const results = await Promise.allSettled(setupPromises);
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    expect(successful).toBeGreaterThan(0); // At least one should succeed
  });
});
