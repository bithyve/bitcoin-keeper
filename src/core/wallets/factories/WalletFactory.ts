import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import { DerivationConfig } from 'src/store/sagas/wallets';
import { hash256 } from 'src/services/operations/encryption';
import config from 'src/core/config';
import { EntityKind, NetworkType, ScriptTypes, VisibilityType, WalletType } from '../enums';
import {
  TransferPolicy,
  Wallet,
  WalletImportDetails,
  WalletPresentationData,
  WalletSpecs,
} from '../interfaces/wallet';

import BIP85 from '../operations/BIP85';
import { BIP85Config } from '../interfaces';
import WalletUtilities from '../operations/utils';
import WalletOperations from '../operations';

export const whirlPoolWalletTypes = [WalletType.PRE_MIX, WalletType.POST_MIX, WalletType.BAD_BANK];

export const generateWalletSpecs = (
  mnemonic: string,
  network: bitcoinJS.Network,
  xDerivationPath: string
) => {
  // derive extended keys
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');
  const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed,
    network,
    xDerivationPath
  );
  const { xpriv } = extendedKeys;
  const { xpub } = extendedKeys;

  const specs: WalletSpecs = {
    xpub,
    xpriv,
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    confirmedUTXOs: [],
    unconfirmedUTXOs: [],
    balances: {
      confirmed: 0,
      unconfirmed: 0,
    },
    transactions: [],
    txNote: {},
    hasNewUpdates: false,
    lastSynched: 0,
    receivingAddress: '',
  };
  return specs;
};

export const generateWallet = async ({
  type,
  instanceNum,
  walletName,
  walletDescription,
  derivationConfig,
  primaryMnemonic,
  importDetails,
  networkType,
  transferPolicy,
  parentMnemonic,
}: {
  type: WalletType;
  instanceNum: number;
  walletName: string;
  walletDescription: string;
  derivationConfig?: DerivationConfig;
  primaryMnemonic?: string;
  importDetails?: WalletImportDetails;
  networkType: NetworkType;
  transferPolicy?: TransferPolicy;
  parentMnemonic?: string;
}): Promise<Wallet> => {
  const network = WalletUtilities.getNetworkByType(networkType);

  let mnemonic: string;
  let xDerivationPath: string;
  let bip85Config: BIP85Config;
  let depositWalletId: string;

  if (type === WalletType.IMPORTED) {
    if (!importDetails) throw new Error('Import details are missing');
    mnemonic = importDetails.mnemonic;
  } else if (whirlPoolWalletTypes.includes(type)) {
    mnemonic = parentMnemonic;
  } else {
    if (!primaryMnemonic) throw new Error('Primary mnemonic missing');
    // BIP85 derivation: primary mnemonic to bip85-child mnemonic
    bip85Config = BIP85.generateBIP85Configuration(type, instanceNum);
    const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);
    mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);
  }

  if (derivationConfig) xDerivationPath = derivationConfig.path;
  else if (importDetails && importDetails.derivationConfig)
    xDerivationPath = importDetails.derivationConfig.path;
  else xDerivationPath = WalletUtilities.getDerivationPath(EntityKind.WALLET, networkType);

  let id = WalletUtilities.getMasterFingerprintFromMnemonic(mnemonic); // case: wallets(non-whirlpool) have master-fingerprints as their id

  if (whirlPoolWalletTypes.includes(type)) {
    depositWalletId = id; // case: whirlpool wallets have master-fingerprints as their deposit id
    id = hash256(`${id}${type}`);
  }

  const derivationDetails = {
    instanceNum,
    mnemonic,
    bip85Config,
    xDerivationPath,
  };

  const defaultShell = 1;
  const presentationData: WalletPresentationData = {
    name: walletName,
    description: walletDescription,
    visibility: VisibilityType.DEFAULT,
    shell: defaultShell,
  };

  const specs: WalletSpecs = generateWalletSpecs(mnemonic, network, xDerivationPath);

  const wallet: Wallet = {
    id,
    entityKind: EntityKind.WALLET,
    type,
    networkType,
    isUsable: true,
    derivationDetails,
    presentationData,
    specs,
    scriptType: ScriptTypes.P2WPKH,
    transferPolicy,
    depositWalletId,
  };
  wallet.specs.receivingAddress = WalletOperations.getNextFreeAddress(wallet);
  return wallet;
};

const generateExtendedKeysForCosigner = (wallet: Wallet) => {
  const seed = bip39.mnemonicToSeedSync(wallet.derivationDetails.mnemonic).toString('hex');
  const xDerivationPath = WalletUtilities.getDerivationPath(EntityKind.VAULT, wallet.networkType);

  const network = WalletUtilities.getNetworkByType(wallet.networkType);
  const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed,
    network,
    xDerivationPath
  );
  return { extendedKeys, xDerivationPath };
};

export const getCosignerDetails = (wallet: Wallet, appId: string) => {
  const deviceId = appId;
  const masterFingerprint = wallet.id;

  const { extendedKeys, xDerivationPath } = generateExtendedKeysForCosigner(wallet);
  return {
    deviceId,
    mfp: masterFingerprint,
    xpub: extendedKeys.xpub,
    derivationPath: xDerivationPath,
  };
};

export const signCosignerPSBT = (wallet: Wallet, serializedPSBT: string) => {
  const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT, { network: config.NETWORK });
  const { extendedKeys } = generateExtendedKeysForCosigner(wallet);

  let vin = 0;
  // eslint-disable-next-line consistent-return
  PSBT.data.inputs.forEach((input) => {
    if (!input.bip32Derivation) return 'signing failed: bip32Derivation missing';

    const { path } = input.bip32Derivation[0];
    const pathLevels = path.split('/');

    const internal = parseInt(pathLevels[pathLevels.length - 2], 10) === 1;
    const childIndex = parseInt(pathLevels[pathLevels.length - 1], 10);

    const network = WalletUtilities.getNetworkByType(wallet.networkType);
    const { privateKey } = WalletUtilities.getPrivateKeyByIndex(
      extendedKeys.xpriv,
      internal,
      childIndex,
      network
    );
    const keyPair = WalletUtilities.getKeyPair(privateKey, network);
    PSBT.signInput(vin, keyPair);
    vin += 1;
  });

  return PSBT.toBase64();
};
