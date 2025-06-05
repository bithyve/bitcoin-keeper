import * as bitcoinJS from 'bitcoinjs-lib';
import { VerificationType } from 'src/models/interfaces/AssistedKeys';
import WalletOperations from 'src/services/wallets/operations';
import WalletUtilities from 'src/services/wallets/operations/utils';
import {
  generateMobileKey,
  generateSeedWordsKey,
  generateVault,
} from 'src/services/wallets/factories/VaultFactory';
import {
  DerivationPurpose,
  NetworkType,
  SignerStorage,
  SignerType,
  TxPriority,
  VaultType,
} from 'src/services/wallets/enums';
import { extractColdCardExport } from 'src/hardware/coldcard';
import {
  generateSignerFromMetaData,
  getSignerNameFromType,
  getSignerSigTypeInfo,
  getWalletConfig,
} from 'src/hardware';
import {
  COLDCARD_EXPORT,
  JADE_MS_EXPORT,
  JADE_SS_EXPORT,
  KEYSTONE_MS_EXPORT,
  KEYSTONE_SS_EXPORT,
  PASSPORT_MS_EXPORT,
  PASSPORT_SS_EXPORT,
  SEEDSIGNER_MS_EXPORT,
  SEEDSIGNER_SS_EXPORT,
} from './signingDeviceExportFormats';
import { getSeedSignerDetails, updateInputsForSeedSigner } from 'src/hardware/seedsigner';
import { decodeURBytes } from 'src/services/qr';
import { getKeystoneDetails, getTxHexFromKeystonePSBT } from 'src/hardware/keystone';
import { URRegistryDecoder } from 'src/services/qr/bc-ur-registry';
import { getPassportDetails } from 'src/hardware/passport';
import { getJadeDetails } from 'src/hardware/jade';
import ElectrumClient from 'src/services/electrum/client';
import { predefinedTestnetNodes } from 'src/services/electrum/predefinedNodes';
import {
  AverageTxFeesByNetwork,
  OutputUTXOs,
  SerializedPSBTEnvelop,
  TransactionPrerequisite,
} from 'src/services/wallets/interfaces';
import { Signer, Vault, VaultScheme, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { setupMobileKey, setupSeedWordsBasedKey } from 'src/hardware/signerSetup';
import { getKeyUID } from 'src/utils/utilities';

jest.mock('src/store/store', () => ({
  store: {
    getState: () => ({
      settings: {
        bitcoinNetworkType: 'TESTNET',
      },
    }),
  },
}));

jest.mock('realm', () => ({}));

const connectToElectrumClient = async () => {
  try {
    ElectrumClient.setActivePeer(predefinedTestnetNodes);
    await ElectrumClient.connect();
    console.log('Electrum connected');
  } catch (err) {
    console.log('failed to connect to Electrum:', err);
    process.exit(1);
  }
};

describe('Vault: Single-Sig(1-of-1)', () => {
  let primaryMnemonic: string;
  let vault: Vault;
  let mobileKey: VaultSigner;
  let mobileKeySigner: Signer;
  let averageTxFees: AverageTxFeesByNetwork;
  let txPrerequisites: TransactionPrerequisite;
  let txnPriority: TxPriority;
  let currentBlockHeight: number;
  let serializedPSBTEnvelops: SerializedPSBTEnvelop[];
  let PSBT: bitcoinJS.Psbt;

  beforeAll(async () => {
    primaryMnemonic =
      'midnight auction hello stereo such fault legal outdoor manual recycle derive like';
    await connectToElectrumClient();
    const { signer, key } = await setupMobileKey({
      primaryMnemonic,
      isMultisig: false,
      isMock: true,
    }); // Note: 1-of-1 vault is now a single-sig vault(uses m/84 instead of m/48)
    mobileKeySigner = signer;
    mobileKey = key;
  });

  test('vault factory: creating a 1-of-1 vault(mobile-key)', async () => {
    const scheme: VaultScheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [mobileKey];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = await generateVault({
      type: vaultType,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme,
      signers: vaultSigners,
      networkType: NetworkType.TESTNET,
    });
    expect(vault.signers.length).toEqual(1);
    expect(vault.isMultiSig).toEqual(false);
  });

  test('vault operations: generating a receive address', () => {
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);
    expect(receivingAddress).toMatch(/^tb1[a-z0-9]{39}$/);
  });

  test('vault operations: fetching balance, UTXOs & transactions', async () => {
    const network = WalletUtilities.getNetworkByType(vault.networkType);
    const { synchedWallets } = await WalletOperations.syncWalletsViaElectrumClient(
      [vault],
      network
    );
    vault = synchedWallets[0].synchedWallet as Vault;

    const { balances, transactions, confirmedUTXOs, unconfirmedUTXOs } = vault.specs;
    const checkUTXO = (utxo) => {
      expect(utxo).toEqual(
        expect.objectContaining({
          txId: expect.any(String),
          vout: expect.any(Number),
          value: expect.any(Number),
          address: expect.any(String),
          height: expect.any(Number),
        })
      );
    };

    confirmedUTXOs.forEach(checkUTXO);
    unconfirmedUTXOs.forEach(checkUTXO);

    const netBalance = [...confirmedUTXOs, ...unconfirmedUTXOs].reduce(
      (sum, utxo) => sum + utxo.value,
      0
    );

    expect(balances.confirmed + balances.unconfirmed).toEqual(netBalance);
    expect(transactions.length).toBeGreaterThan(0);
  });

  test('vault operations: transaction fee fetch', async () => {
    averageTxFees = await WalletOperations.calculateAverageTxFee();
    expect(typeof averageTxFees).toBe('object');
    Object.values(NetworkType).forEach((network) => {
      const fees = averageTxFees[network];
      expect(fees).toBeDefined();
      expect(typeof fees).toBe('object');
      [TxPriority.LOW, TxPriority.MEDIUM, TxPriority.HIGH].forEach((priority) => {
        expect(fees[priority]).toEqual({
          estimatedBlocks: expect.any(Number),
          feePerByte: expect.any(Number),
        });
      });
    });
  });

  test('should fetch the current block height', async () => {
    txnPriority = TxPriority.LOW;
    currentBlockHeight = (await WalletUtilities.fetchCurrentBlockHeight()).currentBlockHeight;
    expect(currentBlockHeight).toBeGreaterThan(0);
  });

  test('should calculate transaction prerequisites using transferST1', async () => {
    const averageTxFeeByNetwork = averageTxFees[vault.networkType];
    const recipients = [
      {
        address: 'tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt',
        amount: 3000,
      },
    ];

    const res = await WalletOperations.transferST1(vault, recipients, averageTxFeeByNetwork);
    txPrerequisites = res.txPrerequisites;

    expect(res.txPrerequisites).toBeDefined();
    expect(res.txRecipients).toBeDefined();

    [TxPriority.LOW, TxPriority.MEDIUM, TxPriority.HIGH].forEach((priority) => {
      const prerequisites = txPrerequisites[priority];
      expect(prerequisites).toEqual(
        expect.objectContaining({
          inputs: expect.arrayContaining([
            expect.objectContaining({
              txId: expect.any(String),
              vout: expect.any(Number),
              value: expect.any(Number),
              address: expect.any(String),
              height: expect.any(Number),
            }),
          ]),
          outputs: expect.arrayContaining([
            expect.objectContaining({
              value: expect.any(Number),
              address: expect.any(String),
            }),
          ]),
          fee: expect.any(Number),
          estimatedBlocks: expect.any(Number),
        })
      );
    });
  });

  test('should construct and broadcast transaction using transferST2', async () => {
    const signerMap = { [getKeyUID(mobileKey)]: mobileKeySigner };
    const res = await WalletOperations.transferST2(
      vault,
      currentBlockHeight,
      txPrerequisites,
      txnPriority,
      null,
      signerMap
    );

    serializedPSBTEnvelops = res.serializedPSBTEnvelops;
    expect(res.cachedTxid).toEqual(expect.any(String));
    expect(serializedPSBTEnvelops).toEqual([
      {
        isMockSigner: true,
        isSigned: true,
        mfp: mobileKey.masterFingerprint,
        serializedPSBT: expect.any(String),
        signerType: mobileKeySigner.type,
        signingPayload: [
          {
            inputs: [
              {
                address: 'tb1qgvtqknk3hmdlpzgc0pghzt3h67r95szmp8pr2d',
                height: expect.any(Number),
                script: { length: 27 },
                txId: '608710eb040d935dedb6c4d6321369382b2bd45533a7442a6fa98add3860d46b',
                value: 6000,
                vout: 1,
              },
            ],
            payloadTarget: mobileKeySigner.type,
          },
        ],
        xfp: mobileKey.xfp,
      },
    ]);
  });

  test('should construct and broadcast transaction using transferST3', async () => {
    const broadcastSpy = jest
      .spyOn(WalletOperations, 'broadcastTransaction')
      .mockResolvedValue('73833807769bbc4f56636cc1cbffb0f57a80bcc305c9df38652819d779df22a1'); // mocking transaction broadcast to avoid subsequent broadcast failure
    const { txid } = await WalletOperations.transferST3(
      vault,
      serializedPSBTEnvelops,
      txPrerequisites,
      txnPriority
    );
    expect(txid).toEqual('73833807769bbc4f56636cc1cbffb0f57a80bcc305c9df38652819d779df22a1');
    broadcastSpy.mockRestore();
  });
});

describe('Vault: Multi-sig(2-of-3)', () => {
  let primaryMnemonic: string;
  let vault: Vault;

  let mobileKey: VaultSigner; // Signer - 1
  let seedWordsKey: VaultSigner; // Signer - 2
  let signingServerKey: VaultSigner; // Signer - 3

  let seedWords;
  let signingServerConfig;
  let averageTxFees;
  let txPrerequisites;
  let txnPriority;
  let currentBlockHeight;
  let serializedPSBTEnvelops: SerializedPSBTEnvelop[];
  const signerMap = {};

  beforeAll(async () => {
    primaryMnemonic =
      'midnight auction hello stereo such fault legal outdoor manual recycle derive like';

    // configure 1st singer: mobile-key
    const { signer, key } = await setupMobileKey({
      primaryMnemonic,
      isMultisig: true,
    });
    mobileKey = key;
    signerMap[getKeyUID(mobileKey)] = signer;

    // configure 2nd signer: seedwords based key
    seedWords = 'absent beauty three bronze reduce runway oil girl decide juice point cruel';
    const { signer: singer2, key: key2 } = setupSeedWordsBasedKey(seedWords, true);
    seedWordsKey = key2;
    signerMap[getKeyUID(seedWordsKey)] = singer2;

    // configure 3rd singer: signing server
    signingServerConfig = {
      method: 'TWO_FA',
      verifier: 'NZDA2HBHGIQSSUCY',
    };
    const { key: key3, signer: signer3 } = generateSignerFromMetaData({
      xpub: 'tpubDERPm4XUYBFJXrA1h3cUQyhZhVXiDkjRRQXJiaSFnqwXnucEseRVcqC99fYgGxZaPEE5ZZu3nKEoW2pVGz2obWBVnpS9Noncs7kw5QkF51q',
      derivationPath: "m/48'/1'/0'/2'",
      masterFingerprint: '3EE66DDF',
      signerType: SignerType.POLICY_SERVER,
      storageType: SignerStorage.WARM,
      isMultisig: true,
      signerPolicy: {
        verification: {
          method: VerificationType.TWO_FA,
        },
        restrictions: {
          none: false,
          maxTransactionAmount: 10000,
        },
        signingDelay: 0,
      },
    });
    signingServerKey = key3;
    signerMap[getKeyUID(signingServerKey)] = signer3;
  });

  test('vault factory: creating a 2-of-3 vault', async () => {
    const scheme = { m: 2, n: 3 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [mobileKey, seedWordsKey, signingServerKey];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = await generateVault({
      type: vaultType,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme,
      signers: vaultSigners,
      networkType: NetworkType.TESTNET,
    });
    expect(vault.scheme.m).toEqual(2);
    expect(vault.signers.length).toEqual(3);
    expect(vault.isMultiSig).toEqual(true);
  });

  test('vault operations: generating a receive address', () => {
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);
    expect(receivingAddress).toEqual(
      'tb1qn0gxmwpqhrxadmxuawm9z6uj4fn5ehhm8fjkglysxp3fa3ft30esnm0max'
    );
  });

  test('vault operations: fetching balance, UTXOs & transactions', async () => {
    const network = WalletUtilities.getNetworkByType(vault.networkType);
    const { synchedWallets } = await WalletOperations.syncWalletsViaElectrumClient(
      [vault],
      network
    );
    vault = synchedWallets[0].synchedWallet as Vault;

    const { balances, transactions, confirmedUTXOs, unconfirmedUTXOs } = vault.specs;
    const checkUTXO = (utxo) => {
      expect(utxo).toEqual(
        expect.objectContaining({
          txId: expect.any(String),
          vout: expect.any(Number),
          value: expect.any(Number),
          address: expect.any(String),
          height: expect.any(Number),
        })
      );
    };

    confirmedUTXOs.forEach(checkUTXO);
    unconfirmedUTXOs.forEach(checkUTXO);
    const netBalance = [...confirmedUTXOs, ...unconfirmedUTXOs].reduce(
      (sum, utxo) => sum + utxo.value,
      0
    );

    expect(balances.confirmed + balances.unconfirmed).toEqual(netBalance);
    expect(transactions.length).toBeGreaterThan(0);
  });

  test('vault operations: transaction fee fetch', async () => {
    averageTxFees = await WalletOperations.calculateAverageTxFee();
    expect(typeof averageTxFees).toBe('object');
    Object.values(NetworkType).forEach((network) => {
      const fees = averageTxFees[network];
      expect(fees).toBeDefined();
      expect(typeof fees).toBe('object');
      [TxPriority.LOW, TxPriority.MEDIUM, TxPriority.HIGH].forEach((priority) => {
        expect(fees[priority]).toEqual({
          estimatedBlocks: expect.any(Number),
          feePerByte: expect.any(Number),
        });
      });
    });
  });

  test('should fetch the current block height', async () => {
    txnPriority = TxPriority.LOW;
    currentBlockHeight = (await WalletUtilities.fetchCurrentBlockHeight()).currentBlockHeight;
    expect(currentBlockHeight).toBeGreaterThan(0);
  });

  test('should calculate transaction prerequisites using transferST1', async () => {
    const averageTxFeeByNetwork = averageTxFees[vault.networkType];
    const recipients = [
      {
        address: 'tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt',
        amount: 3000,
      },
    ];

    const res = await WalletOperations.transferST1(vault, recipients, averageTxFeeByNetwork);
    txPrerequisites = res.txPrerequisites;

    expect(res.txPrerequisites).toBeDefined();
    expect(res.txRecipients).toBeDefined();

    [TxPriority.LOW, TxPriority.MEDIUM, TxPriority.HIGH].forEach((priority) => {
      const prerequisites = txPrerequisites[priority];
      expect(prerequisites).toEqual(
        expect.objectContaining({
          inputs: expect.arrayContaining([
            expect.objectContaining({
              txId: expect.any(String),
              vout: expect.any(Number),
              value: expect.any(Number),
              address: expect.any(String),
              height: expect.any(Number),
            }),
          ]),
          outputs: expect.arrayContaining([
            expect.objectContaining({
              value: expect.any(Number),
              address: expect.any(String),
            }),
          ]),
          fee: expect.any(Number),
          estimatedBlocks: expect.any(Number),
        })
      );
    });
  });

  test('should construct and broadcast transaction using transferST2', async () => {
    const res = await WalletOperations.transferST2(
      vault,
      currentBlockHeight,
      txPrerequisites,
      txnPriority,
      null,
      signerMap
    );
    serializedPSBTEnvelops = res.serializedPSBTEnvelops;
    console.log({ serializedPSBTEnvelops });
    expect(res.cachedTxid).toEqual(expect.any(String));
    expect(serializedPSBTEnvelops.length).toBe(3);
  });

  test('should sign the PSBT using mobileKey - 1st signature', async () => {
    const mobileKeyEnvelopIndex = serializedPSBTEnvelops.findIndex(
      (envelop) => envelop.signerType === SignerType.MOBILE_KEY
    );
    expect(mobileKeyEnvelopIndex).toBeGreaterThanOrEqual(0);

    const { signedSerializedPSBT: mobileKeySignedSerializedPSBT } =
      WalletOperations.internallySignVaultPSBT(
        vault,
        serializedPSBTEnvelops[mobileKeyEnvelopIndex].serializedPSBT,
        mobileKey
      );
    expect(mobileKeySignedSerializedPSBT).toBeDefined();
    serializedPSBTEnvelops[mobileKeyEnvelopIndex] = {
      ...serializedPSBTEnvelops[mobileKeyEnvelopIndex],
      serializedPSBT: mobileKeySignedSerializedPSBT,
    };
  });

  test('should fail to construct and broadcast transaction w/ a single signature', async () => {
    await expect(
      WalletOperations.transferST3(
        vault,
        serializedPSBTEnvelops, // signature 1 of 3
        txPrerequisites,
        txnPriority
      )
    ).rejects.toThrow('Can not finalize input #0');
  });

  test('should sign the PSBT using seed words - 2nd signature', async () => {
    const seedKeyEnvelopIndex = serializedPSBTEnvelops.findIndex(
      (envelop) => envelop.signerType === SignerType.SEED_WORDS
    );
    expect(seedKeyEnvelopIndex).toBeGreaterThanOrEqual(0);

    const { xpub, xpriv } = generateSeedWordsKey(seedWords, NetworkType.TESTNET, true);
    if (seedWordsKey.xpub !== xpub) throw new Error('Invalid mnemonic; xpub mismatch');
    const { signedSerializedPSBT: seedKeySignedSerializedPSBT } =
      WalletOperations.internallySignVaultPSBT(
        vault,
        serializedPSBTEnvelops[seedKeyEnvelopIndex].serializedPSBT,
        { ...seedWordsKey, xpriv }
      );

    expect(seedKeySignedSerializedPSBT).toBeDefined();
    serializedPSBTEnvelops[seedKeyEnvelopIndex] = {
      ...serializedPSBTEnvelops[seedKeyEnvelopIndex],
      serializedPSBT: seedKeySignedSerializedPSBT,
    };
  });

  test('should construct and broadcast transaction using transferST3', async () => {
    const broadcastSpy = jest
      .spyOn(WalletOperations, 'broadcastTransaction')
      .mockResolvedValue('87e91c91d0b663f83d416f1c5b39786cc27fe9a5a5da4c24d391926648b4a868'); // mocking transaction broadcast to avoid subsequent broadcast failure
    const { txid } = await WalletOperations.transferST3(
      vault,
      serializedPSBTEnvelops, // signature 2 of 3
      txPrerequisites,
      txnPriority
    );
    expect(txid).toEqual('87e91c91d0b663f83d416f1c5b39786cc27fe9a5a5da4c24d391926648b4a868');
    broadcastSpy.mockRestore();
  });
});

describe('Vault: AirGapping with Coldcard', () => {
  let vault;
  let extract;
  let coldcard; // Signer
  let signer;

  test('coldcard: extract xpub, derivation and master fingerprint from coldcard export format', () => {
    extract = extractColdCardExport(COLDCARD_EXPORT.data, false);
    expect(extract).toHaveProperty('xpub');
    expect(extract).toHaveProperty('derivationPath');
    expect(extract).toHaveProperty('masterFingerprint');
  });

  test('vault: is able to generate signer from meta-data', () => {
    const { xpub, derivationPath, masterFingerprint } = extract;
    const { key: key5, signer: signer5 } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.COLDCARD,
      storageType: SignerStorage.COLD,
      isMultisig: false,
    });
    coldcard = key5;
    signer = signer5;
    expect(coldcard).toHaveProperty('xpub');
    expect(coldcard).toHaveProperty('derivationPath', derivationPath);
    expect(coldcard).toHaveProperty('masterFingerprint', masterFingerprint);
    expect(signer).toHaveProperty('masterFingerprint', masterFingerprint);
    expect(signer).toHaveProperty('type', SignerType.COLDCARD);
    expect(signer).toHaveProperty('storageType', SignerStorage.COLD);
    expect(signer).toHaveProperty('signerName', getSignerNameFromType(SignerType.COLDCARD));
    const signerSigType = getSignerSigTypeInfo(coldcard, signer);
    expect(signerSigType.isSingleSig).toBeTruthy();
    expect(signerSigType.isMultiSig).toBeFalsy();
    expect(signerSigType.purpose).not.toBe(DerivationPurpose.BIP48.toString());
  });

  test('vault factory: creating a airgapped coldcard', async () => {
    const scheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [coldcard];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = await generateVault({
      type: vaultType,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme,
      signers: vaultSigners,
      networkType: NetworkType.TESTNET,
      signerMap: {},
    });
    expect(vault.signers.length).toEqual(1);
    expect(vault.isMultiSig).toEqual(false);
  });

  test('vault operations: generating a receive address', () => {
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);
    expect(receivingAddress).toEqual('tb1qclvfyg5v9gahygk5la56afevcnpdxt203609gp');
  });
});

describe('Vault: AirGapping with SeedSigner', () => {
  let vault;
  let extract;
  let seedsigner; // Signer
  let signer;

  test('seedsigner: extract xpub, derivation and master fingerprint from seedsigner export format', () => {
    extract = getSeedSignerDetails(SEEDSIGNER_SS_EXPORT.data);
    expect(extract).toHaveProperty('xpub');
    expect(extract).toHaveProperty('derivationPath');
    expect(extract).toHaveProperty('masterFingerprint');
  });

  test('vault: is able to generate signer from meta-data', () => {
    const { xpub, derivationPath, masterFingerprint } = extract;
    const { key: key6, signer: signer6 } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.SEEDSIGNER,
      storageType: SignerStorage.COLD,
      isMultisig: false,
    });
    seedsigner = key6;
    signer = signer6;
    expect(seedsigner).toHaveProperty('xpub');
    expect(seedsigner).toHaveProperty('derivationPath', derivationPath);
    expect(seedsigner).toHaveProperty('masterFingerprint', masterFingerprint);
    expect(signer).toHaveProperty('masterFingerprint', masterFingerprint);
    expect(signer).toHaveProperty('type', SignerType.SEEDSIGNER);
    expect(signer).toHaveProperty('storageType', SignerStorage.COLD);
    expect(signer).toHaveProperty('signerName', getSignerNameFromType(SignerType.SEEDSIGNER));
    const signerSigType = getSignerSigTypeInfo(seedsigner, signer);
    expect(signerSigType.isSingleSig).toBeTruthy();
    expect(signerSigType.isMultiSig).toBeFalsy();
    expect(signerSigType.purpose).not.toBe(DerivationPurpose.BIP48.toString());
  });

  test('vault factory: creating a airgapped seedsigner', async () => {
    const scheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [seedsigner];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = await generateVault({
      type: vaultType,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme,
      signers: vaultSigners,
      networkType: NetworkType.TESTNET,
      signerMap: {},
    });
    expect(vault.signers.length).toEqual(1);
    expect(vault.isMultiSig).toEqual(false);
  });

  test('vault operations: generating a receive address', () => {
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);
    expect(receivingAddress).toEqual('tb1qae8ea8unjccsum9z75qvzhq6vauw88t503yrsf');
  });

  test('seedsigner: able to finalise signed PSBT from seedsigner partial signature', () => {
    const unsignedPSBT =
      'cHNidP8BAFICAAAAAdV/bwKJ4yO8cWQBdGyO7rcbQRFTpRSrawxJmPh3yHRJAQAAAAD/////AREHAAAAAAAAFgAUWuqKm/XkjrJ7aXnZe991fPmIYNsAAAAAAAEBH9AHAAAAAAAAFgAUZXZJ33JeEh4yl7uMQZ5i0agCuZ8iBgLTClhWB9tTYUNHkts1hfzm29IyXWRAL8ttspe8dWmHQBjh5mMQVAAAgAEAAIAAAACAAAAAAAIAAAAAAA==';
    const signedDataFromSeedSigner =
      'cHNidP8BAFICAAAAAdV/bwKJ4yO8cWQBdGyO7rcbQRFTpRSrawxJmPh3yHRJAQAAAAD/////AREHAAAAAAAAFgAUWuqKm/XkjrJ7aXnZe991fPmIYNsAAAAAACICAtMKWFYH21NhQ0eS2zWF/Obb0jJdZEAvy22yl7x1aYdARzBEAiAsOx0YL/VV9qaApH9mAM5q6B5SyPFMOFlvP+j7cOybPAIgU8bLfjCK+uj9mEg08VhY7TrkCdmsKWwj59sifxmHseEBAAA=';
    const { signedPsbt } = updateInputsForSeedSigner({
      serializedPSBT: unsignedPSBT,
      signedSerializedPSBT: signedDataFromSeedSigner,
    });
    expect(signedPsbt).toEqual(
      'cHNidP8BAFICAAAAAdV/bwKJ4yO8cWQBdGyO7rcbQRFTpRSrawxJmPh3yHRJAQAAAAD/////AREHAAAAAAAAFgAUWuqKm/XkjrJ7aXnZe991fPmIYNsAAAAAAAEBH9AHAAAAAAAAFgAUZXZJ33JeEh4yl7uMQZ5i0agCuZ8iAgLTClhWB9tTYUNHkts1hfzm29IyXWRAL8ttspe8dWmHQEcwRAIgLDsdGC/1VfamgKR/ZgDOaugeUsjxTDhZbz/o+3DsmzwCIFPGy34wivro/ZhINPFYWO065AnZrClsI+fbIn8Zh7HhASIGAtMKWFYH21NhQ0eS2zWF/Obb0jJdZEAvy22yl7x1aYdAGOHmYxBUAACAAQAAgAAAAIAAAAAAAgAAAAAA'
    );
  });
});

describe('Vault: AirGapping with Keystone', () => {
  let vault;
  let extract;
  let keystone; // Signer
  let signer;

  test('keystone: extract xpub, derivation and master fingerprint from keystone export format', () => {
    const decoder = new URRegistryDecoder();
    const bytes = decodeURBytes(decoder, KEYSTONE_SS_EXPORT.data);
    extract = getKeystoneDetails(bytes.data);
    expect(extract).toHaveProperty('xpub');
    expect(extract).toHaveProperty('derivationPath');
    expect(extract).toHaveProperty('masterFingerprint');
  });

  test('vault: is able to generate signer from meta-data', () => {
    const { xpub, derivationPath, masterFingerprint } = extract;
    const { key: key7, signer: signer7 } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.KEYSTONE,
      storageType: SignerStorage.COLD,
      isMultisig: false,
    });
    keystone = key7;
    signer = signer7;
    expect(keystone).toHaveProperty('xpub');
    expect(keystone).toHaveProperty('derivationPath', derivationPath);
    expect(keystone).toHaveProperty('masterFingerprint', masterFingerprint);
    expect(signer).toHaveProperty('masterFingerprint', masterFingerprint);
    expect(signer).toHaveProperty('type', SignerType.KEYSTONE);
    expect(signer).toHaveProperty('storageType', SignerStorage.COLD);
    expect(signer).toHaveProperty('signerName', getSignerNameFromType(SignerType.KEYSTONE));
    const signerSigType = getSignerSigTypeInfo(keystone, signer);
    expect(signerSigType.isSingleSig).toBeTruthy();
    expect(signerSigType.isMultiSig).toBeFalsy();
    expect(signerSigType.purpose).not.toBe(DerivationPurpose.BIP48.toString());
  });

  test('vault factory: creating a airgapped keystone', async () => {
    const scheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [keystone];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = await generateVault({
      type: vaultType,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme,
      signers: vaultSigners,
      networkType: NetworkType.TESTNET,
      signerMap: {},
    });
    expect(vault.signers.length).toEqual(1);
    expect(vault.isMultiSig).toEqual(false);
  });

  test('vault operations: generating a receive address', () => {
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);
    expect(receivingAddress).toEqual('tb1qpzgrhkjdkkwwc2gs4zvsw0y02z9jm5v5gvp55c');
  });

  test('keystone: able to tx hex from keystone signed PSBT', () => {
    const unsignedPSBT =
      'cHNidP8BAFICAAAAAWDZhpqs0eI234UqgV99Z4M2nkksep5tN5UEU31zTvSOAAAAAAD/////AREHAAAAAAAAFgAUKWbDXXd/+5CjjqWG6QEFgK4DR1YAAAAAAAEBH9AHAAAAAAAAFgAUBZ/+krqj5Ua1FrT3Pa8ki7GRoGEiBgOCErqEPy/FMfK1ExL62IBT7B10wfQqyw/aTo1cs8R6fBhhuPzEVAAAgAEAAIAAAACAAAAAAAIAAAAAAA==';
    const signedDataFromKeystone =
      'cHNidP8BAFICAAAAAWDZhpqs0eI234UqgV99Z4M2nkksep5tN5UEU31zTvSOAAAAAAD/////AREHAAAAAAAAFgAUKWbDXXd/+5CjjqWG6QEFgK4DR1YAAAAAAAEBH9AHAAAAAAAAFgAUBZ/+krqj5Ua1FrT3Pa8ki7GRoGEBCGsCRzBEAiBjWgWBZVfMI0N6FhqsnQa6BFk8Vp4YN0TIBckBu8ZOYAIgfnMLj/Its93d2hzbUP2IKARGR4vs5SaZvOv9lucNq3oBIQOCErqEPy/FMfK1ExL62IBT7B10wfQqyw/aTo1cs8R6fAAA';
    const extractedTransaction = getTxHexFromKeystonePSBT(unsignedPSBT, signedDataFromKeystone);
    expect(extractedTransaction.toHex()).toEqual(
      '0200000000010160d9869aacd1e236df852a815f7d6783369e492c7a9e6d379504537d734ef48e0000000000ffffffff0111070000000000001600142966c35d777ffb90a38ea586e9010580ae034756024730440220635a05816557cc23437a161aac9d06ba04593c569e183744c805c901bbc64e6002207e730b8ff22db3ddddda1cdb50fd88280446478bece52699bcebfd96e70dab7a0121038212ba843f2fc531f2b51312fad88053ec1d74c1f42acb0fda4e8d5cb3c47a7c00000000'
    );
  });
});

describe('Vault: AirGapping with Passport', () => {
  let vault;
  let extract;
  let passport; // Signer
  let signer;

  test('passport: extract xpub, derivation and master fingerprint from passport export format', () => {
    const decoder = new URRegistryDecoder();
    let bytes;
    PASSPORT_SS_EXPORT.forEach((item) => {
      const { percentage, data } = decodeURBytes(decoder, item.data);
      if (percentage === 100) {
        bytes = data;
      }
    });
    extract = getPassportDetails(bytes);
    expect(extract).toHaveProperty('xpub');
    expect(extract).toHaveProperty('derivationPath');
    expect(extract).toHaveProperty('masterFingerprint');
  });

  test('vault: is able to generate signer from meta-data', () => {
    const { xpub, derivationPath, masterFingerprint } = extract;
    const { key: key8, signer: signer8 } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.PASSPORT,
      storageType: SignerStorage.COLD,
      isMultisig: false,
    });
    passport = key8;
    signer = signer8;
    expect(passport).toHaveProperty('xpub');
    expect(passport).toHaveProperty('derivationPath', derivationPath);
    expect(passport).toHaveProperty('masterFingerprint', masterFingerprint);
    expect(signer).toHaveProperty('masterFingerprint', masterFingerprint);
    expect(signer).toHaveProperty('type', SignerType.PASSPORT);
    expect(signer).toHaveProperty('storageType', SignerStorage.COLD);
    expect(signer).toHaveProperty('signerName', getSignerNameFromType(SignerType.PASSPORT));
    const signerSigType = getSignerSigTypeInfo(passport, signer);
    expect(signerSigType.isSingleSig).toBeTruthy();
    expect(signerSigType.isMultiSig).toBeFalsy();
    expect(signerSigType.purpose).not.toBe(DerivationPurpose.BIP48.toString());
  });

  test('vault factory: creating a airgapped passport', async () => {
    const scheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [passport];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = await generateVault({
      type: vaultType,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme,
      signers: vaultSigners,
      networkType: NetworkType.TESTNET,
      signerMap: {},
    });
    expect(vault.signers.length).toEqual(1);
    expect(vault.isMultiSig).toEqual(false);
  });

  test('vault operations: generating a receive address', () => {
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);
    expect(receivingAddress).toEqual('tb1qk2k65grkkct3pql0hfzjkl0app8eaxuhf5l206');
  });
});

describe('Vault: AirGapping with Jade', () => {
  let vault;
  let extract;
  let jade; // Signer
  let signer;

  test('jade: extract xpub, derivation and master fingerprint from jade export format', () => {
    const decoder = new URRegistryDecoder();
    let bytes;
    JADE_SS_EXPORT.forEach((item) => {
      const { percentage, data } = decodeURBytes(decoder, item.data);
      if (percentage === 100) {
        bytes = data;
      }
    });
    extract = getJadeDetails(bytes);
    expect(extract).toHaveProperty('xpub');
    expect(extract).toHaveProperty('derivationPath');
    expect(extract).toHaveProperty('masterFingerprint');
  });

  test('vault: is able to generate signer from meta-data', () => {
    const { xpub, derivationPath, masterFingerprint } = extract;
    const { key: key9, signer: signer9 } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.JADE,
      storageType: SignerStorage.COLD,
      isMultisig: false,
    });
    jade = key9;
    signer = signer9;
    expect(jade).toHaveProperty('xpub');
    expect(jade).toHaveProperty('derivationPath', derivationPath);
    expect(jade).toHaveProperty('masterFingerprint', masterFingerprint);
    expect(signer).toHaveProperty('masterFingerprint', masterFingerprint);
    expect(signer).toHaveProperty('type', SignerType.JADE);
    expect(signer).toHaveProperty('storageType', SignerStorage.COLD);
    expect(signer).toHaveProperty('signerName', getSignerNameFromType(SignerType.JADE));
    const signerSigType = getSignerSigTypeInfo(jade, signer);
    expect(signerSigType.isSingleSig).toBeTruthy();
    expect(signerSigType.isMultiSig).toBeFalsy();
    expect(signerSigType.purpose).not.toBe(DerivationPurpose.BIP48.toString());
  });

  test('vault factory: creating a airgapped jade', async () => {
    const scheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [jade];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = await generateVault({
      type: vaultType,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme,
      signers: vaultSigners,
      networkType: NetworkType.TESTNET,
      signerMap: {},
    });
    expect(vault.signers.length).toEqual(1);
    expect(vault.isMultiSig).toEqual(false);
  });

  test('vault operations: generating a receive address', () => {
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);
    expect(receivingAddress).toEqual('tb1ql7vr9yn9u7qdsgfukyh5mt2ppv7njm93upu43c');
  });
});

describe('Vault: Multi-sig(3-of-5)', () => {
  let vault;
  let signers = [];
  let vaultSigners = [];
  let ccExtract;
  let ssExtract;
  let ksExtract;
  let psExtract;
  let jdExtract;

  test('signers: extract xpub, derivation and master fingerprint from thier export format', () => {
    ccExtract = extractColdCardExport(COLDCARD_EXPORT.data, true);
    ssExtract = getSeedSignerDetails(SEEDSIGNER_MS_EXPORT.data);
    let decoder = new URRegistryDecoder();
    let bytes = decodeURBytes(decoder, KEYSTONE_MS_EXPORT.data);
    ksExtract = getKeystoneDetails(bytes.data);
    decoder = new URRegistryDecoder();
    PASSPORT_MS_EXPORT.forEach((item) => {
      const { percentage, data } = decodeURBytes(decoder, item.data);
      if (percentage === 100) {
        bytes = data;
      }
    });
    psExtract = getPassportDetails(bytes);
    decoder = new URRegistryDecoder();
    JADE_MS_EXPORT.forEach((item) => {
      const { percentage, data } = decodeURBytes(decoder, item.data);
      if (percentage === 100) {
        bytes = data;
      }
    });
    jdExtract = getJadeDetails(bytes);
    [ccExtract, ssExtract, ksExtract, psExtract, jdExtract].map((extract) => {
      expect(extract).toHaveProperty('xpub');
      expect(extract).toHaveProperty('derivationPath');
      expect(extract).toHaveProperty('masterFingerprint');
    });
  });

  test('vault: is able to generate signers from meta-data', () => {
    const signerTypes = [
      SignerType.COLDCARD,
      SignerType.SEEDSIGNER,
      SignerType.KEYSTONE,
      SignerType.PASSPORT,
      SignerType.JADE,
    ];

    const items = [ccExtract, ssExtract, ksExtract, psExtract, jdExtract].map((extract, index) => {
      const { xpub, derivationPath, masterFingerprint } = extract;
      return generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        signerType: signerTypes[index],
        storageType: SignerStorage.COLD,
        isMultisig: true,
      });
    });

    items.map((item, index) => {
      const signer = item.signer;
      const key = item.key;
      expect(key).toHaveProperty('xpub', key.xpub);
      expect(key).toHaveProperty('derivationPath', key.derivationPath);
      expect(key).toHaveProperty('masterFingerprint', key.masterFingerprint);
      expect(signer).toHaveProperty('masterFingerprint', key.masterFingerprint);
      expect(signer).toHaveProperty('type', signerTypes[index]);
      expect(signer).toHaveProperty('storageType', SignerStorage.COLD);
      expect(signer).toHaveProperty('signerName', getSignerNameFromType(signerTypes[index]));
      const signerSigType = getSignerSigTypeInfo(key, signer);
      expect(signerSigType.isSingleSig).toBeFalsy();
      expect(signerSigType.isMultiSig).toBeTruthy();
      expect(signerSigType.purpose).toBe(DerivationPurpose.BIP48.toString());
      signers.push(signer);
      vaultSigners.push(key);
      return key;
    });
  });

  test('vault factory: creating a 3-of-5 vault', async () => {
    const scheme = { m: 3, n: 5 };
    const vaultType = VaultType.DEFAULT;
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = await generateVault({
      type: vaultType,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme,
      signers: vaultSigners,
      networkType: NetworkType.TESTNET,
      signerMap: {},
    });
    expect(vault.scheme.m).toEqual(3);
    expect(vault.signers.length).toEqual(5);
    expect(vault.isMultiSig).toEqual(true);
  });

  test('vault operations: generating a receive address', () => {
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);
    expect(receivingAddress).toEqual(
      'tb1qlwglqfsh3t4a7tzpkllwqassfspwm783wfhc2z38wut7kuuu8syq8qrchz'
    );
  });

  test('registration: generate multisig wallet config from vault', () => {
    const config = getWalletConfig({ vault });
    expect(config).toEqual(
      `# Multisig setup file (exported from Keeper)\nName: Keeper vault\nPolicy: 3 of 5\nFormat: P2WSH\n\nDerivation: m/48'/1'/13'/2'\nB47CF9C5: tpubDEiMpcmjNAHc2cbp7WT3farFPeZELsp37xz6TRTcGVydvCueXPAC4kR5KsTwoDefF8cuqt7JNmZ47t9CkwZh9cVtvzZBjoYMtQHnWjqtJae\n\nDerivation: m/48'/1'/0'/2'\ne1e66310: tpubDErAEXwPSNh2Fvuhv9zPEEqBqYDfo17X9TBAmxQM95cKV21q6eBdhDpy9mn7wYCx7miazJVYETXf4AYKdatTJrr4XSLXoFDPoQTFYKuN1xX\n\nDerivation: m/48'/1'/0'/2'\n61b8fcc4: tpubDFPK2k7Xr8BKBi84KvVfLkztfRn9XCjWmjXkHcuL5Mur8pm5aJKQtorfKXcTFDAMbQ27Bbk8VnZUpHhu5fDz9aaWYQ6Hy2nDDaPpJL9KbNM\n\nDerivation: m/48'/1'/0'/2'\n2EBB3CC0: tpubDFE7HNZ4NACV7j7HLz2CdYWpFERVpn49oWFZxZfPdyhjS9NND7EPrnd95zy9JdmRMrSnAC5qL7Ld5ifYNXKmM7dJLSTKWjsM8SMFMzYujWK\n\nDerivation: m/48'/0'/0'/2'\nf61f3570: tpubDDqKgV5GfzCZbBokSaVQtnzBAFyo2knRwkZ62d5mV5ZpEFMCQFMmNZM5S6pRUexCFrKmhrae3KFfFt7hsh2F2J4DMa9WPpn8eYWAmZvUSbq\n\n`
    );
  });
});
