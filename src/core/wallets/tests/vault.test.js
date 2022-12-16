/* eslint-disable no-undef */
import Relay from 'src/core/services/operations/Relay';
import { getRandomBytes } from 'src/core/services/operations/encryption';
import * as bitcoinJS from 'bitcoinjs-lib';
import { VerificationType } from 'src/core/services/interfaces';
import SigningServer from 'src/core/services/operations/SigningServer';
import idx from 'idx';
import { authenticator } from 'otplib';
import WalletOperations from '../operations';
import WalletUtilities from '../operations/utils';
import { generateMobileKey, generateSeedWordsKey, generateVault } from '../factories/VaultFactory';
import { NetworkType, SignerStorage, SignerType, TxPriority, VaultType } from '../enums';

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
    const { xpub, xpriv, derivationPath, masterFingerprint, bip85Config } = await generateMobileKey(
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
      bip85Config,
      lastHealthCheck: new Date(),
      addedOn: new Date(),
    };
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
    expect(receivingAddress).toEqual('tb1qj66at89t06cpwv6fyqps2n3q6gwzz53rsa6y4c');
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

    expect(balances.confirmed + balances.unconfirmed).toEqual(6000);
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
        amount: 3000,
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
    const { xpub, xpriv, derivationPath, masterFingerprint, bip85Config } = await generateMobileKey(
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
      bip85Config,
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

  test('vault factory: creating a 2-of-3 vault', async () => {
    const scheme = { m: 2, n: 3 };
    const vaultType = VaultType.DEFAULT;
    const vaultSigners = [mobileKey, signingServer, softSigner];
    const vaultDetails = {
      name: 'Vault',
      description: 'Secure your sats',
    };

    vault = await generateVault({
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
      'tb1qa7dwqkhm77m673kgpyd7xk9j496xgu3t6ntkq04zspmfhxdjfyxsxdfjz8'
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
