import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import { DerivationConfig } from 'src/store/sagas/wallets';
import { hash256 } from 'src/utils/service-utilities/encryption';
import config from 'src/utils/service-utilities/config';
import {
  EntityKind,
  ImportedKeyType,
  NetworkType,
  ScriptTypes,
  VisibilityType,
  WalletType,
  XpubTypes,
} from '../enums';
import {
  TransferPolicy,
  Wallet,
  WalletDerivationDetails,
  WalletImportDetails,
  WalletPresentationData,
  WalletSpecs,
} from '../interfaces/wallet';

import BIP85 from '../operations/BIP85';
import { BIP85Config } from '../interfaces';
import WalletUtilities from '../operations/utils';
import WalletOperations from '../operations';
import { XpubDetailsType } from '../interfaces/vault';

export const generateWalletSpecsFromMnemonic = (
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
    totalExternalAddresses: 1,
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

export const generateWalletSpecsFromExtendedKeys = (
  extendedKey: string,
  extendedKeyType: ImportedKeyType
) => {
  let xpriv: string;
  let xpub: string;

  if (WalletUtilities.isExtendedPrvKey(extendedKeyType)) {
    xpriv = WalletUtilities.getXprivFromExtendedKey(extendedKey, config.NETWORK);
    xpub = WalletUtilities.getPublicExtendedKeyFromPriv(xpriv);
  } else if (WalletUtilities.isExtendedPubKey(extendedKeyType)) {
    xpub = WalletUtilities.getXpubFromExtendedKey(extendedKey, config.NETWORK);
  } else {
    throw new Error('Invalid key');
  }

  const specs: WalletSpecs = {
    xpub,
    xpriv,
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    totalExternalAddresses: 1,
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
  wallets,
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
  wallets: Wallet[];
}): Promise<Wallet> => {
  const network = WalletUtilities.getNetworkByType(networkType);

  let bip85Config: BIP85Config;
  let id: string;
  let derivationDetails: WalletDerivationDetails;
  let specs: WalletSpecs;

  if (type === WalletType.IMPORTED) {
    // case: import wallet via mnemonic
    if (!importDetails) throw new Error('Import details are missing');
    const { importedKey, importedKeyDetails, derivationConfig } = importDetails;

    let mnemonic;
    if (importedKeyDetails.importedKeyType === ImportedKeyType.MNEMONIC) {
      // case: import wallet via mnemonic
      mnemonic = importedKey;
      id = WalletUtilities.getMasterFingerprintFromMnemonic(mnemonic); // case: wallets(non-whirlpool) have master-fingerprints as their id
      derivationDetails = {
        instanceNum,
        mnemonic,
        bip85Config,
        xDerivationPath: derivationConfig.path,
      };

      specs = generateWalletSpecsFromMnemonic(mnemonic, network, derivationDetails.xDerivationPath);
    } else {
      // case: import wallet via extended keys

      derivationDetails = {
        instanceNum, // null
        mnemonic, // null
        bip85Config, // null
        xDerivationPath: derivationConfig.path,
      };

      specs = generateWalletSpecsFromExtendedKeys(importedKey, importedKeyDetails.importedKeyType);

      id = WalletUtilities.getFingerprintFromExtendedKey(specs.xpriv || specs.xpub, config.NETWORK); // case: extended key imported wallets have xfp as their id
    }
  } else {
    // case: adding new wallet
    if (!primaryMnemonic) throw new Error('Primary mnemonic missing');
    // BIP85 derivation: primary mnemonic to bip85-child mnemonic
    bip85Config = BIP85.generateBIP85Configuration(type, instanceNum);
    const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);

    const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);
    derivationDetails = {
      instanceNum,
      mnemonic,
      bip85Config,
      xDerivationPath: derivationConfig
        ? derivationConfig.path
        : WalletUtilities.getDerivationPath(EntityKind.WALLET, networkType),
    };
    id = WalletUtilities.getMasterFingerprintFromMnemonic(mnemonic);
    const idWithDerivation = id + derivationDetails.xDerivationPath;
    const existingWallet = wallets.find((wallet) => wallet.id === id);
    if (existingWallet) {
      if (existingWallet.derivationDetails.xDerivationPath === derivationDetails.xDerivationPath) {
        throw Error('Hot wallet for this mobile key already exists.');
      }
    }
    if (wallets.find((wallet) => wallet.id === idWithDerivation)) {
      throw Error('Hot wallet for this mobile key already exists.');
    }
    id = idWithDerivation;
    specs = generateWalletSpecsFromMnemonic(mnemonic, network, derivationDetails.xDerivationPath);
  }

  const defaultShell = 1;
  const presentationData: WalletPresentationData = {
    name: walletName,
    description: walletDescription,
    visibility: VisibilityType.DEFAULT,
    shell: defaultShell,
  };
  const scriptType: ScriptTypes = WalletUtilities.getScriptTypeFromPurpose(
    WalletUtilities.getPurpose(derivationDetails.xDerivationPath)
  );

  const wallet: Wallet = {
    id,
    entityKind: EntityKind.WALLET,
    type,
    networkType,
    isUsable: true,
    derivationDetails,
    presentationData,
    specs,
    scriptType,
    transferPolicy,
  };
  wallet.specs.receivingAddress = WalletOperations.getNextFreeAddress(wallet);
  return wallet;
};

export const generateExtendedKeysForCosigner = (
  mnemonic: string,
  entityKind: EntityKind = EntityKind.VAULT
) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');
  const xDerivationPath = WalletUtilities.getDerivationPath(entityKind, config.NETWORK_TYPE);

  const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
  const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed,
    network,
    xDerivationPath
  );
  return { extendedKeys, xDerivationPath };
};

export const getCosignerDetails = async (
  primaryMnemonic: string,
  instanceNum: number,
  singleSig: boolean = false
) => {
  const bip85Config = BIP85.generateBIP85Configuration(WalletType.DEFAULT, instanceNum);
  const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);
  const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);

  const { extendedKeys, xDerivationPath } = generateExtendedKeysForCosigner(
    mnemonic,
    singleSig ? EntityKind.WALLET : EntityKind.VAULT
  );

  const xpubDetails: XpubDetailsType = {};
  if (singleSig) {
    xpubDetails[XpubTypes.P2WPKH] = {
      xpub: extendedKeys.xpub,
      derivationPath: xDerivationPath,
      xpriv: extendedKeys.xpriv,
    };
  } else {
    xpubDetails[XpubTypes.P2WSH] = {
      xpub: extendedKeys.xpub,
      derivationPath: xDerivationPath,
      xpriv: extendedKeys.xpriv,
    };
  }

  return {
    mfp: WalletUtilities.getMasterFingerprintFromMnemonic(mnemonic),
    xpubDetails,
  };
};

export const signCosignerPSBT = (fingerprint: string, xpriv: string, serializedPSBT: string) => {
  // utilized by SignerType.MY_KEEPER and SignerType.KEEPER(External Keeper App)
  const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT, { network: config.NETWORK });
  let vin = 0;

  // w/ input.bip32Derivation[0] the sub-path(incorrect especially in case of miniscript-multipath),
  // from whatever was the first key, was getting consumed

  PSBT.data.inputs.forEach((input) => {
    if (!input.bip32Derivation) return 'signing failed: bip32Derivation missing';

    let subPaths = [];
    for (const { masterFingerprint, path } of input.bip32Derivation) {
      if (masterFingerprint.toString('hex').toUpperCase() === fingerprint) {
        const pathFragments = path.split('/');
        const chainIndex = parseInt(pathFragments[pathFragments.length - 2], 10); // multipath external/internal chain index
        const childIndex = parseInt(pathFragments[pathFragments.length - 1], 10);
        subPaths.push([chainIndex, childIndex]);
      }
    }
    if (subPaths.length == 0) throw new Error('Failed to sign internally - missing subpath');

    subPaths.forEach((subPath) => {
      const keyPair = WalletUtilities.getKeyPairByIndex(
        xpriv,
        subPath[0],
        subPath[1],
        config.NETWORK
      );
      PSBT.signInput(vin, keyPair);
    });
    vin += 1;
  });

  return PSBT.toBase64();
};
