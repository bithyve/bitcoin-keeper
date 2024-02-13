import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import { DerivationConfig } from 'src/store/sagas/wallets';
import { hash256 } from 'src/services/operations/encryption';
import config from 'src/core/config';
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

export const whirlPoolWalletTypes = [WalletType.PRE_MIX, WalletType.POST_MIX, WalletType.BAD_BANK];

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

  let bip85Config: BIP85Config;
  let depositWalletId: string;
  let id: string;
  let derivationDetails: WalletDerivationDetails;
  let specs: WalletSpecs;

  if (type === WalletType.IMPORTED) {
    // case: adding imported wallet
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
  } else if (whirlPoolWalletTypes.includes(type)) {
    // case: adding whirlpool wallet
    const mnemonic = parentMnemonic;
    depositWalletId = WalletUtilities.getMasterFingerprintFromMnemonic(mnemonic); // case: whirlpool wallets have master-fingerprints as their deposit id
    id = hash256(`${id}${type}`);

    derivationDetails = {
      instanceNum,
      mnemonic,
      bip85Config,
      xDerivationPath: derivationConfig
        ? derivationConfig.path
        : WalletUtilities.getDerivationPath(EntityKind.WALLET, networkType),
    };
    specs = generateWalletSpecsFromMnemonic(mnemonic, network, derivationDetails.xDerivationPath);
  } else {
    // case: adding new wallet
    if (!primaryMnemonic) throw new Error('Primary mnemonic missing');
    // BIP85 derivation: primary mnemonic to bip85-child mnemonic
    bip85Config = BIP85.generateBIP85Configuration(type, instanceNum);
    const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);

    const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);
    id = WalletUtilities.getMasterFingerprintFromMnemonic(mnemonic); // case: wallets(non-whirlpool) have master-fingerprints as their id

    derivationDetails = {
      instanceNum,
      mnemonic,
      bip85Config,
      xDerivationPath: derivationConfig
        ? derivationConfig.path
        : WalletUtilities.getDerivationPath(EntityKind.WALLET, networkType),
    };
    specs = generateWalletSpecsFromMnemonic(mnemonic, network, derivationDetails.xDerivationPath);
  }

  const defaultShell = 1;
  const presentationData: WalletPresentationData = {
    name: walletName,
    description: walletDescription,
    visibility: VisibilityType.DEFAULT,
    shell: defaultShell,
  };

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

const generateExtendedKeysForCosigner = (
  wallet: Wallet,
  entityKind: EntityKind = EntityKind.VAULT
) => {
  const seed = bip39.mnemonicToSeedSync(wallet.derivationDetails.mnemonic).toString('hex');
  const xDerivationPath = WalletUtilities.getDerivationPath(entityKind, wallet.networkType);

  const network = WalletUtilities.getNetworkByType(wallet.networkType);
  const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed,
    network,
    xDerivationPath
  );
  return { extendedKeys, xDerivationPath };
};

export const getCosignerDetails = (wallet: Wallet, singleSig: boolean = false) => {
  const masterFingerprint = wallet.id;

  const { extendedKeys, xDerivationPath } = generateExtendedKeysForCosigner(
    wallet,
    singleSig ? EntityKind.WALLET : EntityKind.VAULT
  );

  const xpubDetails: XpubDetailsType = {};
  if (singleSig) {
    xpubDetails[XpubTypes.P2WPKH] = {
      xpub: extendedKeys.xpub,
      derivationPath: xDerivationPath,
    };
  } else {
    xpubDetails[XpubTypes.P2WSH] = {
      xpub: extendedKeys.xpub,
      derivationPath: xDerivationPath,
    };
  }

  return {
    mfp: masterFingerprint,
    xpubDetails,
  };
};

export const signCosignerPSBT = (
  wallet: Wallet,
  serializedPSBT: string,
  entityKind: EntityKind = EntityKind.VAULT
) => {
  const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT, { network: config.NETWORK });
  const { extendedKeys } = generateExtendedKeysForCosigner(wallet, entityKind);

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
