import * as bitcoinJS from 'bitcoinjs-lib';
import { VerificationType } from 'src/models/interfaces/AssistedKeys';
import SigningServer from 'src/services/backend/SigningServer';
import idx from 'idx';
import { authenticator } from 'otplib';
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

jest.setTimeout(20000);

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

describe('Vault: Single-sig(1-of-1)', () => {
  let primaryMnemonic;
  let vault;
  let mobileKey;
  let averageTxFees;
  let txPrerequisites;
  let txnPriority;
  let PSBT;

  beforeAll(async () => {
    primaryMnemonic =
      'duty burger portion domain athlete sweet birth impact miss shield help peanut';

    await connectToElectrumClient();

    const networkType = NetworkType.TESTNET;

    const { xpub, xpriv, derivationPath, masterFingerprint } = await generateMobileKey(
      primaryMnemonic,
      networkType
    );
    const { key: key1 } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.MOBILE_KEY,
      storageType: SignerStorage.WARM,
      isMultisig: true,
      xpriv,
    });
    mobileKey = key1;
  });

  test('vault factory: creating a 1-of-1 vault(mobile-key)', async () => {
    const scheme = { m: 1, n: 1 };
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
      signerMap: {},
    });
    expect(vault.signers.length).toEqual(1);
    expect(vault.isMultiSig).toEqual(false);
  });

  test('vault operations: generating a receive address', () => {
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);
    expect(receivingAddress).toEqual('tb1qvndgkznthw8zghkwg5ayjjer473pxf8gu492j4');
  });

  test('vault operations: fetching balance, utxos & transactions', async () => {
    const network = WalletUtilities.getNetworkByType(vault.networkType);
    const { synchedWallets } = await WalletOperations.syncWalletsViaElectrumClient(
      [vault],
      network
    );
    [vault] = synchedWallets;

    const { balances, transactions, confirmedUTXOs, unconfirmedUTXOs } = vault.synchedWallet.specs;

    let netBalance = 0;
    confirmedUTXOs.forEach((utxo) => {
      netBalance += utxo.value;
    });
    unconfirmedUTXOs.forEach((utxo) => {
      netBalance += utxo.value;
    });

    expect(balances.confirmed + balances.unconfirmed).toEqual(3300);
    expect(netBalance).toEqual(balances.confirmed + balances.unconfirmed);
    expect(transactions.length).toEqual(1);
  });

  test('vault operations: transaction fee fetch', async () => {
    const averageTxFeeByNetwork = await WalletOperations.calculateAverageTxFee();
    averageTxFees = averageTxFeeByNetwork;
    expect(averageTxFees[NetworkType.MAINNET]).toBeDefined();
    expect(averageTxFees[NetworkType.TESTNET]).toBeDefined();
  });

  test('vault operations: transaction pre-requisites(priority based coinselection)', async () => {
    const averageTxFeeByNetwork = averageTxFees[vault.networkType];
    const recipients = [
      {
        address: 'tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt',
        amount: 2000,
      },
    ];

    const res = await WalletOperations.transferST1(vault, recipients, averageTxFeeByNetwork);
    txPrerequisites = res.txPrerequisites;

    expect(txPrerequisites[TxPriority.LOW]).toBeDefined();
    expect(txPrerequisites[TxPriority.MEDIUM]).toBeDefined();
    expect(txPrerequisites[TxPriority.HIGH]).toBeDefined();
  });

  test('vault operations: transaction construction(PSBT)', async () => {
    txnPriority = TxPriority.LOW;
    const res = await WalletOperations.createTransaction(vault, txPrerequisites, txnPriority);
    PSBT = res.PSBT;
    expect(PSBT.data.inputs.length).toBeGreaterThan(0);
    expect(PSBT.data.outputs.length).toBeGreaterThan(0);
  });

  test('vault operations: transaction signing(PSBT)', async () => {
    const { inputs } = txPrerequisites[txnPriority];

    const serialisedPSBT = PSBT.toBase64();
    const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
      vault,
      inputs,
      serialisedPSBT,
      mobileKey.xpriv
    );
    const signedPSBT = bitcoinJS.Psbt.fromBase64(signedSerializedPSBT);

    // const areSignaturesValid = signedPSBT.validateSignaturesOfAllInputs();
    // expect(areSignaturesValid).toEqual(true);

    const txHex = signedPSBT.finalizeAllInputs().extractTransaction().toHex();
    expect(txHex).toBeDefined();
  });
});

describe('Vault: Multi-sig(2-of-3)', () => {
  let primaryMnemonic;
  let vault;

  let mobileKey; // Signer - 1
  let signingServer; // Signer - 2
  let softSigner; // Signer - 3

  let seedwords;
  let signingServerConfig;
  let averageTxFees;
  let txPrerequisites;
  let txnPriority;
  let PSBT;
  let recipients;
  let transaction;
  let signerMap = {};
  const signedSerializedPSBTs = [];
  const signers = [];

  beforeAll(async () => {
    primaryMnemonic =
      'duty burger portion domain athlete sweet birth impact miss shield hunt peanut';

    // configure 1st singer: mobile-key
    const networkType = NetworkType.TESTNET;
    const { xpub, xpriv, derivationPath, masterFingerprint } = await generateMobileKey(
      primaryMnemonic,
      networkType
    );

    const { key: key2, signer: signer2 } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.MOBILE_KEY,
      storageType: SignerStorage.WARM,
      isMultisig: true,
      xpriv,
    });
    mobileKey = key2;
    signers.push(signer2);

    // configure 2nd singer: signing server
    const signingServerXpub =
      'tpubDEy3jjqkWNw6NHyYD89NyeP28L1eSuJGrp7SiWw9utzrawV3VyY45W2jYWcJdLNvqLcC3yfGGHN5g1Tm6HekPtp1f5vkgJpkTWehumF2JKn';
    const signingServerMasterFingerprint = '45EBB0F6';
    signingServerConfig = {
      method: 'TWO_FA',
      verifier: 'PJ4HOTJYIZ3EETCEK53XSK3INZHG4VBV',
    };
    const policy = {
      verification: {
        method: VerificationType.TWO_FA,
      },
      restrictions: {
        none: false,
        maxTransactionAmount: 10000000,
      },
      exceptions: {
        none: false,
        transactionAmount: 1000000,
      },
    };
    const { key: key3, signer: signer3 } = generateSignerFromMetaData({
      xpub: signingServerXpub,
      derivationPath,
      masterFingerprint: signingServerMasterFingerprint,
      signerType: SignerType.POLICY_SERVER,
      storageType: SignerStorage.WARM,
      isMultisig: true,
      signerPolicy: policy,
    });
    signingServer = key3;
    signers.push(signer3);

    // configure 3rd singer: signing server
    seedwords = 'crisp sausage hunt resource green meat rude volume what bamboo flash extra';
    const seedwordSignerConfig = generateSeedWordsKey(seedwords, networkType);
    const { key: key4, signer: signer4 } = generateSignerFromMetaData({
      xpub: seedwordSignerConfig.xpub,
      derivationPath: seedwordSignerConfig.derivationPath,
      masterFingerprint: seedwordSignerConfig.masterFingerprint,
      signerType: SignerType.SEED_WORDS,
      storageType: SignerStorage.WARM,
      isMultisig: true,

      xpriv: seedwordSignerConfig.xpriv,
    });
    softSigner = key4;
    signers.push(signer4);
  });

  test('vault factory: creating a 2-of-3 vault', async () => {
    const scheme = { m: 2, n: 3 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [mobileKey, signingServer, softSigner];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    signerMap = signers.reduce((acc, signer) => {
      acc[signer.masterFingerprint] = signer;
      return acc;
    }, {});

    vault = await generateVault({
      type: vaultType,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme,
      signers: vaultSigners,
      networkType: NetworkType.TESTNET,
      signerMap,
    });
    expect(vault.scheme.m).toEqual(2);
    expect(vault.signers.length).toEqual(3);
    expect(vault.isMultiSig).toEqual(true);
  });

  test('vault operations: generating a receive address', () => {
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);
    expect(receivingAddress).toEqual(
      'tb1qet0mjzd50luyjurja0h6t4jy0y0e6eu976aa9e565s2c4etwuzts0lyd32'
    );
  });

  test('vault operations: fetching balance, utxos & transactions', async () => {
    const network = WalletUtilities.getNetworkByType(vault.networkType);
    const { synchedWallets } = await WalletOperations.syncWalletsViaElectrumClient(
      [vault],
      network
    );
    [vault] = synchedWallets;

    const { balances, transactions, confirmedUTXOs, unconfirmedUTXOs } = vault.synchedWallet.specs;

    let netBalance = 0;
    confirmedUTXOs.forEach((utxo) => {
      netBalance += utxo.value;
    });
    unconfirmedUTXOs.forEach((utxo) => {
      netBalance += utxo.value;
    });

    expect(balances.confirmed + balances.unconfirmed).toEqual(4000);
    expect(netBalance).toEqual(balances.confirmed + balances.unconfirmed);
    expect(transactions.length).toEqual(1);
  });

  test('vault operations: transaction fee fetch', async () => {
    const averageTxFeeByNetwork = await WalletOperations.calculateAverageTxFee();
    averageTxFees = averageTxFeeByNetwork;
    expect(averageTxFees[NetworkType.MAINNET]).toBeDefined();
    expect(averageTxFees[NetworkType.TESTNET]).toBeDefined();
  });

  test('vault operations: transaction pre-requisites(priority based coinselection)', async () => {
    const averageTxFeeByNetwork = averageTxFees[vault.networkType];
    recipients = [
      {
        address: 'tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt',
        amount: 2000,
      },
    ];

    const res = await WalletOperations.transferST1(vault, recipients, averageTxFeeByNetwork);
    txPrerequisites = res.txPrerequisites;

    expect(txPrerequisites[TxPriority.LOW]).toBeDefined();
    expect(txPrerequisites[TxPriority.MEDIUM]).toBeDefined();
    expect(txPrerequisites[TxPriority.HIGH]).toBeDefined();
  });

  test('vault operations: transaction construction(PSBT)', async () => {
    txnPriority = TxPriority.MEDIUM;
    transaction = await WalletOperations.createTransaction(vault, txPrerequisites, txnPriority);
    PSBT = transaction.PSBT;
    expect(PSBT.data.inputs.length).toBeGreaterThan(0);
    expect(PSBT.data.outputs.length).toBeGreaterThan(0);
  });

  test('vault operations: Sign PSBT(signer - seedwords softkey)', async () => {
    const { inputs, outputs } = txPrerequisites[txnPriority];

    let outgoing = 0;
    recipients.forEach((recipient) => {
      outgoing += recipient.amount;
    });

    const { serializedPSBTEnvelop } = WalletOperations.signVaultTransaction(
      vault,
      inputs,
      PSBT,
      softSigner,
      outgoing,
      outputs,
      transaction.change,
      signerMap
    );

    expect(serializedPSBTEnvelop?.serializedPSBT).toBeDefined();
    const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
      vault,
      inputs,
      serializedPSBTEnvelop.serializedPSBT,
      softSigner.xpriv
    );
    signedSerializedPSBTs.push(signedSerializedPSBT);
  });

  test('vault operations: Sign PSBT(signer - server key)', async () => {
    const { inputs, outputs } = txPrerequisites[txnPriority];

    let outgoing = 0;
    recipients.forEach((recipient) => {
      outgoing += recipient.amount;
    });

    const { serializedPSBTEnvelop } = WalletOperations.signVaultTransaction(
      vault,
      inputs,
      PSBT,
      signingServer,
      outgoing,
      outputs,
      transaction.change,
      signerMap
    );

    const { serializedPSBT, signingPayload } = serializedPSBTEnvelop;
    const childIndexArray = idx(signingPayload, (_) => _[0].childIndexArray);
    expect(childIndexArray).toBeDefined();

    const token = authenticator.generate(signingServerConfig.verifier);
    expect(token).toBeDefined();

    jest.setTimeout(10000);
    const { signedPSBT } = await SigningServer.signPSBT(
      signingServer.xfp,
      Number(token),
      serializedPSBT,
      childIndexArray,
      outgoing
    );
    expect(signedPSBT).toBeDefined();
    signedSerializedPSBTs.push(signedPSBT);
  });

  test('vault operations: combine and validate PSBT & construct txHex', async () => {
    let combinedPSBT;
    // eslint-disable-next-line no-restricted-syntax
    for (const signedSerializedPSBT of signedSerializedPSBTs) {
      const signedPSBT = bitcoinJS.Psbt.fromBase64(signedSerializedPSBT);
      if (!combinedPSBT) combinedPSBT = signedPSBT;
      else combinedPSBT.combine(signedPSBT);
    }
    // const areSignaturesValid = combinedPSBT.validateSignaturesOfAllInputs();
    // expect(areSignaturesValid).toEqual(true);

    const txHex = combinedPSBT.finalizeAllInputs().extractTransaction().toHex();
    expect(txHex).toBeDefined();
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
