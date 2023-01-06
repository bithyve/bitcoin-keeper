import Relay from 'src/core/services/operations/Relay';
import { getRandomBytes } from 'src/core/services/operations/encryption';
import * as bitcoinJS from 'bitcoinjs-lib';
import { VerificationType } from 'src/core/services/interfaces';
import SigningServer from 'src/core/services/operations/SigningServer';
import idx from 'idx';
import { authenticator } from 'otplib';
import WalletOperations from 'src/core/wallets/operations';
import WalletUtilities from 'src/core/wallets/operations/utils';
import {
  generateMobileKey,
  generateSeedWordsKey,
  generateVault,
} from 'src/core/wallets/factories/VaultFactory';
import {
  DerivationPurpose,
  NetworkType,
  SignerStorage,
  SignerType,
  TxPriority,
  VaultType,
} from 'src/core/wallets/enums';
import { extractColdCardExport } from 'src/hardware/coldcard';
import {
  generateSignerFromMetaData,
  getSignerNameFromType,
  getSignerSigTypeInfo,
} from 'src/hardware';
import {
  COLDCARD_SS_EXPORT,
  JADE_SS_EXPORT,
  KEYSTONE_SS_EXPORT,
  PASSPORT_SS_EXPORT,
  SEEDSIGNER_SS_EXPORT,
} from './signingDeviceExportFormats';
import { getSeedSignerDetails, updateInputsForSeedSigner } from 'src/hardware/seedsigner';
import { decodeURBytes } from 'src/core/services/qr';
import { getKeystoneDetails, getTxHexFromKeystonePSBT } from 'src/hardware/keystone';
import { URRegistryDecoder } from 'src/core/services/qr/bc-ur-registry';
import { getPassportDetails } from 'src/hardware/passport';
import { getJadeDetails } from 'src/hardware/jade';

jest.setTimeout(10000);

describe('Vault: Single-sig(1-of-1)', () => {
  let primaryMnemonic;
  let vaultShell;
  let vault;
  let mobileKey;
  let averageTxFees;
  let txPrerequisites;
  let txnPriority;
  let PSBT;

  beforeAll(async () => {
    primaryMnemonic =
      'duty burger portion domain athlete sweet birth impact miss shield help peanut';
    vaultShell = {
      id: getRandomBytes(12),
      vaultInstances: {},
    };

    const networkType = NetworkType.TESTNET;
    const network = WalletUtilities.getNetworkByType(networkType);
    const { xpub, xpriv, derivationPath, masterFingerprint } = await generateMobileKey(
      primaryMnemonic,
      networkType
    );

    mobileKey = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      type: SignerType.MOBILE_KEY,
      signerName: 'Mobile Key',
      storageType: SignerStorage.WARM,
      xpub,
      xpriv,
      xpubInfo: {
        derivationPath,
        xfp: masterFingerprint,
      },
      lastHealthCheck: new Date(),
      addedOn: new Date(),
    };
  });

  test('vault factory: creating a 1-of-1 vault(mobile-key)', () => {
    const scheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [mobileKey];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = generateVault({
      type: vaultType,
      vaultShellId: vaultShell.id,
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
    const { receivingAddress, updatedWallet } = WalletOperations.getNextFreeExternalAddress(vault);
    vault = updatedWallet;
    expect(receivingAddress).toEqual('tb1qvndgkznthw8zghkwg5ayjjer473pxf8gu492j4');
  });

  test('vault operations: fetching balance, utxos & transactions', async () => {
    const network = WalletUtilities.getNetworkByType(vault.networkType);
    const { synchedWallets } = await WalletOperations.syncWallets([vault], network);
    [vault] = synchedWallets;

    const { balances, transactions, confirmedUTXOs, unconfirmedUTXOs } = vault.specs;

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
    const res = await Relay.fetchFeeAndExchangeRates();
    averageTxFees = res.averageTxFees;
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

    const areSignaturesValid = signedPSBT.validateSignaturesOfAllInputs();
    expect(areSignaturesValid).toEqual(true);

    const txHex = signedPSBT.finalizeAllInputs().extractTransaction().toHex();
    expect(txHex).toBeDefined();
  });
});

describe('Vault: Multi-sig(2-of-3)', () => {
  let primaryMnemonic;
  let vaultShell;
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
  const signedSerializedPSBTs = [];

  beforeAll(async () => {
    primaryMnemonic =
      'duty burger portion domain athlete sweet birth impact miss shield help peanut';
    vaultShell = {
      id: getRandomBytes(12),
      vaultInstances: {},
    };

    // configure 1st singer: mobile-key
    const networkType = NetworkType.TESTNET;
    const network = WalletUtilities.getNetworkByType(networkType);
    const { xpub, xpriv, derivationPath, masterFingerprint } = await generateMobileKey(
      primaryMnemonic,
      networkType
    );

    mobileKey = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      type: SignerType.MOBILE_KEY,
      signerName: 'Mobile Key',
      storageType: SignerStorage.WARM,
      xpub,
      xpriv,
      xpubInfo: {
        derivationPath,
        xfp: masterFingerprint,
      },
      lastHealthCheck: new Date(),
      addedOn: new Date(),
    };

    // configure 2nd singer: signing server
    const signingServerXpub =
      'tpubDEy3jjqkWNw6NHyYD89NyeP28L1eSuJGrp7SiWw9utzrawV3VyY45W2jYWcJdLNvqLcC3yfGGHN5g1Tm6HekPtp1f5vkgJpkTWehumF2JKn';
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
    signingServer = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(signingServerXpub, network),
      type: SignerType.POLICY_SERVER,
      signerName: 'Signing Server',
      xpub: signingServerXpub,
      xpubInfo: {
        derivationPath: "m/48'/1'/99852'/1'",
        xfp: 'EC9B478C',
      },
      lastHealthCheck: new Date(),
      addedOn: new Date(),
      storageType: SignerStorage.WARM,
      signerPolicy: policy,
    };

    // configure 3rd singer: signing server
    seedwords = 'crisp sausage hunt resource green meat rude volume what bamboo flash extra';
    const seedwordSignerConfig = generateSeedWordsKey(seedwords, networkType);
    softSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(seedwordSignerConfig.xpub, network),
      type: SignerType.SEED_WORDS,
      storageType: SignerStorage.WARM,
      signerName: 'Seed Words',
      xpub: seedwordSignerConfig.xpub,
      xpubInfo: {
        derivationPath: seedwordSignerConfig.derivationPath,
        xfp: seedwordSignerConfig.masterFingerprint,
      },
      lastHealthCheck: new Date(),
      addedOn: new Date(),
    };
  });

  test('vault factory: creating a 2-of-3 vault', () => {
    const scheme = { m: 2, n: 3 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [mobileKey, signingServer, softSigner];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = generateVault({
      type: vaultType,
      vaultShellId: vaultShell.id,
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
    const { receivingAddress, updatedWallet } = WalletOperations.getNextFreeExternalAddress(vault);
    vault = updatedWallet;
    expect(receivingAddress).toEqual(
      'tb1qwge5tf2s48z7kqfeg6lck8yphrskvxds45jlev07dlqrjfa953zs44hgzu'
    );
  });

  test('vault operations: fetching balance, utxos & transactions', async () => {
    const network = WalletUtilities.getNetworkByType(vault.networkType);
    const { synchedWallets } = await WalletOperations.syncWallets([vault], network);
    [vault] = synchedWallets;

    const { balances, transactions, confirmedUTXOs, unconfirmedUTXOs } = vault.specs;

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
    const res = await Relay.fetchFeeAndExchangeRates();
    averageTxFees = res.averageTxFees;
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
    txnPriority = TxPriority.MEDIUM;
    const res = await WalletOperations.createTransaction(vault, txPrerequisites, txnPriority);
    PSBT = res.PSBT;
    expect(PSBT.data.inputs.length).toBeGreaterThan(0);
    expect(PSBT.data.outputs.length).toBeGreaterThan(0);
  });

  test('vault operations: Sign PSBT(signer - seedwords softkey)', async () => {
    const { inputs } = txPrerequisites[txnPriority];
    const networkType = NetworkType.TESTNET;
    const { xpriv } = generateSeedWordsKey(seedwords, networkType);

    const { serializedPSBTEnvelop } = WalletOperations.signVaultTransaction(
      vault,
      inputs,
      PSBT,
      seedwords,
      2000
    );
    expect(serializedPSBTEnvelop?.serializedPSBT).toBeDefined();
    const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
      vault,
      inputs,
      serializedPSBTEnvelop.serializedPSBT,
      xpriv
    );
    signedSerializedPSBTs.push(signedSerializedPSBT);
  });

  test('vault operations: Sign PSBT(signer - signing server)', async () => {
    const { inputs } = txPrerequisites[txnPriority];

    const { serializedPSBTEnvelop } = WalletOperations.signVaultTransaction(
      vault,
      inputs,
      PSBT,
      signingServer,
      2000
    );

    const { serializedPSBT, signingPayload } = serializedPSBTEnvelop;
    const childIndexArray = idx(signingPayload, (_) => _[0].childIndexArray);
    expect(childIndexArray).toBeDefined();

    const token = authenticator.generate(signingServerConfig.verifier);
    const appId = '72fbf5e684036112eebb5e6f71a81491fa17f1d51ae593af331cb467690fd49d';
    expect(token).toBeDefined();

    jest.setTimeout(10000);
    const { signedPSBT } = await SigningServer.signPSBT(
      appId,
      token,
      serializedPSBT,
      childIndexArray,
      2000
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
    const areSignaturesValid = combinedPSBT.validateSignaturesOfAllInputs();
    expect(areSignaturesValid).toEqual(true);

    const txHex = combinedPSBT.finalizeAllInputs().extractTransaction().toHex();
    expect(txHex).toBeDefined();
  });
});

describe('Vault: AirGapping with Coldcard', () => {
  let vaultShell;
  let vault;
  let extract;
  let coldcard; // Signer

  beforeAll(async () => {
    vaultShell = {
      id: getRandomBytes(12),
      vaultInstances: {},
    };
  });

  test('coldcard: extract xpub, derivation and master fingerprint from cc export format', () => {
    extract = extractColdCardExport(COLDCARD_SS_EXPORT.data, COLDCARD_SS_EXPORT.rtdName);
    expect(extract).toHaveProperty('xpub');
    expect(extract).toHaveProperty('derivationPath');
    expect(extract).toHaveProperty('xfp');
  });

  test('vault: is able to generate signer from meta-data', () => {
    const { xpub, derivationPath, xfp } = extract;
    coldcard = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.COLDCARD,
      storageType: SignerStorage.COLD,
    });
    expect(coldcard).toHaveProperty('xpub', xpub);
    expect(coldcard).toHaveProperty('xpubInfo.derivationPath', derivationPath);
    expect(coldcard).toHaveProperty('xpubInfo.xfp', xfp);
    expect(coldcard).toHaveProperty('type', SignerType.COLDCARD);
    expect(coldcard).toHaveProperty('storageType', SignerStorage.COLD);
    expect(coldcard).toHaveProperty('signerName', getSignerNameFromType(SignerType.COLDCARD));
    const signerSigType = getSignerSigTypeInfo(coldcard);
    expect(signerSigType.isSingleSig).toBeTruthy();
    expect(signerSigType.isMultiSig).toBeFalsy();
    expect(signerSigType.purpose).not.toBe(DerivationPurpose.BIP48.toString());
  });

  test('vault factory: creating a airgapped coldcard', () => {
    const scheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [coldcard];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = generateVault({
      type: vaultType,
      vaultShellId: vaultShell.id,
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
    const { receivingAddress, updatedWallet } = WalletOperations.getNextFreeExternalAddress(vault);
    vault = updatedWallet;
    expect(receivingAddress).toEqual('tb1qclvfyg5v9gahygk5la56afevcnpdxt203609gp');
  });
});

describe('Vault: AirGapping with SeedSigner', () => {
  let vaultShell;
  let vault;
  let extract;
  let seedsigner; // Signer

  beforeAll(async () => {
    vaultShell = {
      id: getRandomBytes(12),
      vaultInstances: {},
    };
  });

  test('seedsigner: extract xpub, derivation and master fingerprint from cc export format', () => {
    extract = getSeedSignerDetails(SEEDSIGNER_SS_EXPORT.data);
    expect(extract).toHaveProperty('xpub');
    expect(extract).toHaveProperty('derivationPath');
    expect(extract).toHaveProperty('xfp');
  });

  test('vault: is able to generate signer from meta-data', () => {
    const { xpub, derivationPath, xfp } = extract;
    seedsigner = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.SEEDSIGNER,
      storageType: SignerStorage.COLD,
    });
    expect(seedsigner).toHaveProperty('xpub', xpub);
    expect(seedsigner).toHaveProperty('xpubInfo.derivationPath', derivationPath);
    expect(seedsigner).toHaveProperty('xpubInfo.xfp', xfp);
    expect(seedsigner).toHaveProperty('type', SignerType.SEEDSIGNER);
    expect(seedsigner).toHaveProperty('storageType', SignerStorage.COLD);
    expect(seedsigner).toHaveProperty('signerName', getSignerNameFromType(SignerType.SEEDSIGNER));
    const signerSigType = getSignerSigTypeInfo(seedsigner);
    expect(signerSigType.isSingleSig).toBeTruthy();
    expect(signerSigType.isMultiSig).toBeFalsy();
    expect(signerSigType.purpose).not.toBe(DerivationPurpose.BIP48.toString());
  });

  test('vault factory: creating a airgapped seedsigner', () => {
    const scheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [seedsigner];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = generateVault({
      type: vaultType,
      vaultShellId: vaultShell.id,
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
    const { receivingAddress, updatedWallet } = WalletOperations.getNextFreeExternalAddress(vault);
    vault = updatedWallet;
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
  let vaultShell;
  let vault;
  let extract;
  let keystone; // Signer

  beforeAll(async () => {
    vaultShell = {
      id: getRandomBytes(12),
      vaultInstances: {},
    };
  });

  test('keystone: extract xpub, derivation and master fingerprint from cc export format', () => {
    const decoder = new URRegistryDecoder();
    const bytes = decodeURBytes(decoder, KEYSTONE_SS_EXPORT.data);
    extract = getKeystoneDetails(bytes.data);
    expect(extract).toHaveProperty('xpub');
    expect(extract).toHaveProperty('derivationPath');
    expect(extract).toHaveProperty('xfp');
  });

  test('vault: is able to generate signer from meta-data', () => {
    const { xpub, derivationPath, xfp } = extract;
    keystone = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.KEYSTONE,
      storageType: SignerStorage.COLD,
    });
    expect(keystone).toHaveProperty('xpub', xpub);
    expect(keystone).toHaveProperty('xpubInfo.derivationPath', derivationPath);
    expect(keystone).toHaveProperty('xpubInfo.xfp', xfp);
    expect(keystone).toHaveProperty('type', SignerType.KEYSTONE);
    expect(keystone).toHaveProperty('storageType', SignerStorage.COLD);
    expect(keystone).toHaveProperty('signerName', getSignerNameFromType(SignerType.KEYSTONE));
    const signerSigType = getSignerSigTypeInfo(keystone);
    expect(signerSigType.isSingleSig).toBeTruthy();
    expect(signerSigType.isMultiSig).toBeFalsy();
    expect(signerSigType.purpose).not.toBe(DerivationPurpose.BIP48.toString());
  });

  test('vault factory: creating a airgapped keystone', () => {
    const scheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [keystone];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = generateVault({
      type: vaultType,
      vaultShellId: vaultShell.id,
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
    const { receivingAddress, updatedWallet } = WalletOperations.getNextFreeExternalAddress(vault);
    vault = updatedWallet;
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
  let vaultShell;
  let vault;
  let extract;
  let passport; // Signer

  beforeAll(async () => {
    vaultShell = {
      id: getRandomBytes(12),
      vaultInstances: {},
    };
  });

  test('passport: extract xpub, derivation and master fingerprint from cc export format', () => {
    const decoder = new URRegistryDecoder();
    let bytes;
    PASSPORT_SS_EXPORT.forEach((item, index) => {
      const { percentage, data } = decodeURBytes(decoder, item.data);
      if (percentage === 100) {
        bytes = data;
      }
    });
    extract = getPassportDetails(bytes);
    expect(extract).toHaveProperty('xpub');
    expect(extract).toHaveProperty('derivationPath');
    expect(extract).toHaveProperty('xfp');
  });

  test('vault: is able to generate signer from meta-data', () => {
    const { xpub, derivationPath, xfp } = extract;
    passport = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.PASSPORT,
      storageType: SignerStorage.COLD,
    });
    expect(passport).toHaveProperty('xpub', xpub);
    expect(passport).toHaveProperty('xpubInfo.derivationPath', derivationPath);
    expect(passport).toHaveProperty('xpubInfo.xfp', xfp);
    expect(passport).toHaveProperty('type', SignerType.PASSPORT);
    expect(passport).toHaveProperty('storageType', SignerStorage.COLD);
    expect(passport).toHaveProperty('signerName', getSignerNameFromType(SignerType.PASSPORT));
    const signerSigType = getSignerSigTypeInfo(passport);
    expect(signerSigType.isSingleSig).toBeTruthy();
    expect(signerSigType.isMultiSig).toBeFalsy();
    expect(signerSigType.purpose).not.toBe(DerivationPurpose.BIP48.toString());
  });

  test('vault factory: creating a airgapped passport', () => {
    const scheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [passport];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = generateVault({
      type: vaultType,
      vaultShellId: vaultShell.id,
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
    const { receivingAddress, updatedWallet } = WalletOperations.getNextFreeExternalAddress(vault);
    vault = updatedWallet;
    expect(receivingAddress).toEqual('tb1qk2k65grkkct3pql0hfzjkl0app8eaxuhf5l206');
  });
});

describe('Vault: AirGapping with Jade', () => {
  let vaultShell;
  let vault;
  let extract;
  let jade; // Signer

  beforeAll(async () => {
    vaultShell = {
      id: getRandomBytes(12),
      vaultInstances: {},
    };
  });

  test('jade: extract xpub, derivation and master fingerprint from cc export format', () => {
    const decoder = new URRegistryDecoder();
    let bytes;
    JADE_SS_EXPORT.forEach((item, index) => {
      const { percentage, data } = decodeURBytes(decoder, item.data);
      if (percentage === 100) {
        bytes = data;
      }
    });
    extract = getJadeDetails(bytes);
    expect(extract).toHaveProperty('xpub');
    expect(extract).toHaveProperty('derivationPath');
    expect(extract).toHaveProperty('xfp');
  });

  test('vault: is able to generate signer from meta-data', () => {
    const { xpub, derivationPath, xfp } = extract;
    jade = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.JADE,
      storageType: SignerStorage.COLD,
    });
    expect(jade).toHaveProperty('xpub', xpub);
    expect(jade).toHaveProperty('xpubInfo.derivationPath', derivationPath);
    expect(jade).toHaveProperty('xpubInfo.xfp', xfp);
    expect(jade).toHaveProperty('type', SignerType.JADE);
    expect(jade).toHaveProperty('storageType', SignerStorage.COLD);
    expect(jade).toHaveProperty('signerName', getSignerNameFromType(SignerType.JADE));
    const signerSigType = getSignerSigTypeInfo(jade);
    expect(signerSigType.isSingleSig).toBeTruthy();
    expect(signerSigType.isMultiSig).toBeFalsy();
    expect(signerSigType.purpose).not.toBe(DerivationPurpose.BIP48.toString());
  });

  test('vault factory: creating a airgapped jade', () => {
    const scheme = { m: 1, n: 1 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [jade];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = generateVault({
      type: vaultType,
      vaultShellId: vaultShell.id,
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
    const { receivingAddress, updatedWallet } = WalletOperations.getNextFreeExternalAddress(vault);
    vault = updatedWallet;
    expect(receivingAddress).toEqual('tb1ql7vr9yn9u7qdsgfukyh5mt2ppv7njm93upu43c');
  });
});
