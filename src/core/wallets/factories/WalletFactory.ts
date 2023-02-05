import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
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

export const generateWallet = async ({
  type,
  instanceNum,
  walletName,
  walletDescription,
  primaryMnemonic,
  importDetails,
  networkType,
  transferPolicy,
}: {
  type: WalletType;
  instanceNum: number;
  walletName: string;
  walletDescription: string;
  primaryMnemonic?: string;
  importDetails?: WalletImportDetails;
  networkType: NetworkType;
  transferPolicy: TransferPolicy;
}): Promise<Wallet> => {
  const network = WalletUtilities.getNetworkByType(networkType);

  let mnemonic: string;
  let xDerivationPath: string;
  let bip85Config: BIP85Config;

  if (type === WalletType.IMPORTED) {
    mnemonic = importDetails.mnemonic;
    xDerivationPath =
      importDetails.derivationPath ||
      WalletUtilities.getDerivationPath(EntityKind.WALLET, networkType);
  } else {
    if (!primaryMnemonic) throw new Error('Primary mnemonic missing');
    // BIP85 derivation: primary mnemonic to bip85-child mnemonic
    bip85Config = BIP85.generateBIP85Configuration(type, instanceNum);
    const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);

    mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);
    xDerivationPath = WalletUtilities.getDerivationPath(EntityKind.WALLET, networkType);
  }

  const id = WalletUtilities.getFingerprintFromMnemonic(mnemonic);
  // derive extended keys
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');
  const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed,
    network,
    xDerivationPath
  );
  const { xpriv } = extendedKeys;
  const { xpub } = extendedKeys;

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
  };
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
  const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT);
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
