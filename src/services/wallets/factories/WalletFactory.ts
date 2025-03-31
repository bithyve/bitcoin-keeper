import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import { DerivationConfig } from 'src/store/sagas/wallets';
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
import { store } from 'src/store/store';

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
  const { bitcoinNetwork } = store.getState().settings;

  if (WalletUtilities.isExtendedPrvKey(extendedKeyType)) {
    xpriv = WalletUtilities.getXprivFromExtendedKey(extendedKey, bitcoinNetwork);
    xpub = WalletUtilities.getPublicExtendedKeyFromPriv(xpriv);
  } else if (WalletUtilities.isExtendedPubKey(extendedKeyType)) {
    xpub = WalletUtilities.getXpubFromExtendedKey(extendedKey, bitcoinNetwork);
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
  wallets: Wallet[];
}): Promise<Wallet> => {
  const network = WalletUtilities.getNetworkByType(networkType);
  const { bitcoinNetwork } = store.getState().settings;

  let bip85Config: BIP85Config;
  let id: string;
  let derivationDetails: WalletDerivationDetails;
  let specs: WalletSpecs;

  if (type === WalletType.IMPORTED) {
    if (!importDetails) throw new Error('Import details are missing');
    const { importedKey, importedKeyDetails, derivationConfig } = importDetails;

    // case: import wallet via extended keys

    derivationDetails = {
      instanceNum, // null
      mnemonic: null, // null
      bip85Config, // null
      xDerivationPath: derivationConfig.path,
    };

    specs = generateWalletSpecsFromExtendedKeys(importedKey, importedKeyDetails.importedKeyType);
    id = WalletUtilities.getFingerprintFromExtendedKey(specs.xpriv || specs.xpub, bitcoinNetwork); // case: extended key imported wallets have xfp as their id
    if (wallets.find((wallet) => wallet.id === id)) {
      throw Error('Hot wallet for this mobile key already exists.');
    }
  } else {
    // case: adding new wallet
    if (!primaryMnemonic) throw new Error('Primary mnemonic missing');
    if (!derivationConfig) throw new Error('Wallet derivation missing');
    // BIP85 derivation: primary mnemonic to bip85-child mnemonic
    bip85Config = BIP85.generateBIP85Configuration(type, instanceNum);
    const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);

    const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);
    derivationDetails = {
      instanceNum,
      mnemonic,
      bip85Config,
      xDerivationPath: derivationConfig.path,
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
  };
  wallet.specs.receivingAddress = WalletOperations.getNextFreeAddress(wallet);
  return wallet;
};

export const generateExtendedKeysForCosigner = (mnemonic: string, isMultisig: boolean) => {
  const { bitcoinNetworkType } = store.getState().settings;
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');
  const xDerivationPath = WalletUtilities.getDerivationPath(isMultisig, bitcoinNetworkType, 0);

  const network = WalletUtilities.getNetworkByType(bitcoinNetworkType);
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

  const { extendedKeys, xDerivationPath } = generateExtendedKeysForCosigner(mnemonic, !singleSig);

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
  const { bitcoinNetwork } = store.getState().settings;
  const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT, { network: bitcoinNetwork });
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
        bitcoinNetwork
      );
      PSBT.signInput(vin, keyPair);
    });
    vin += 1;
  });

  return PSBT.toBase64();
};
