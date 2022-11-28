import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import { EntityKind, NetworkType, VisibilityType, WalletType } from '../enums';
import {
  Wallet,
  WalletDerivationDetails,
  WalletPresentationData,
  WalletSpecs,
} from '../interfaces/wallet';

import BIP85 from '../operations/BIP85';
import { BIP85Config } from '../interfaces';
import WalletUtilities from '../operations/utils';

export const generateWallet = async ({
  type,
  instanceNum,
  walletShellId,
  walletName,
  walletDescription,
  primaryMnemonic,
  importedMnemonic,
  importedXpub,
  networkType,
  transferPolicy,
}: {
  type: WalletType;
  instanceNum: number;
  walletShellId: string;
  walletName: string;
  walletDescription: string;
  primaryMnemonic?: string;
  importedMnemonic?: string;
  importedXpub?: string;
  networkType: NetworkType;
  transferPolicy: number;
}): Promise<Wallet> => {
  const network = WalletUtilities.getNetworkByType(networkType);
  let xpriv: string, xpub: string, id: string, derivationDetails: WalletDerivationDetails;

  switch (type) {
    case WalletType.READ_ONLY:
      xpub = importedXpub;
      id = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
      break;

    default:
      let mnemonic: string, bip85Config: BIP85Config;
      if (type === WalletType.IMPORTED) mnemonic = importedMnemonic;
      else {
        if (!primaryMnemonic) throw new Error('Primary mnemonic missing');
        // BIP85 derivation: primary mnemonic to bip85-child mnemonic
        bip85Config = BIP85.generateBIP85Configuration(type, instanceNum);
        const entropy = await BIP85.bip39MnemonicToEntropy(
          bip85Config.derivationPath,
          primaryMnemonic
        );
        mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);
      }

      id = WalletUtilities.getFingerprintFromMnemonic(mnemonic);
      // derive extended keys
      const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');
      const xDerivationPath = WalletUtilities.getDerivationPath(EntityKind.WALLET, networkType);
      const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
        seed,
        network,
        xDerivationPath
      );
      xpriv = extendedKeys.xpriv;
      xpub = extendedKeys.xpub;

      derivationDetails = {
        instanceNum,
        mnemonic,
        bip85Config,
        xDerivationPath,
      };
  }

  const presentationData: WalletPresentationData = {
    name: walletName,
    description: walletDescription,
    visibility: VisibilityType.DEFAULT,
  };

  const specs: WalletSpecs = {
    xpub,
    xpriv,
    activeAddresses: {
      external: {},
      internal: {},
    },
    importedAddresses: {},
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    confirmedUTXOs: [],
    unconfirmedUTXOs: [],
    balances: {
      confirmed: 0,
      unconfirmed: 0,
    },
    transactions: [],
    lastSynched: 0,
    txIdCache: {},
    transactionMapping: [],
    transactionNote: {},
    transferPolicy,
  };

  const wallet: Wallet = {
    id,
    walletShellId,
    entityKind: EntityKind.WALLET,
    type,
    networkType,
    isUsable: true,
    derivationDetails,
    presentationData,
    specs,
  };
  return wallet;
};

export const getCosignerDetails = (wallet: Wallet, appId: string) => {
  const deviceId = appId;
  const masterFingerprint = wallet.id;
  const derivationPath = wallet.derivationDetails.xDerivationPath;
  const xpub = wallet.specs.xpub;

  return { deviceId, mfp: masterFingerprint, xpub, derivationPath };
};

export const signCosignerPSBT = (wallet: Wallet, serializedPSBT: string) => {
  const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT);

  let vin = 0;
  PSBT.data.inputs.forEach((input) => {
    if (!input.bip32Derivation) return 'signing failed: bip32Derivation missing';

    const path = input.bip32Derivation[0].path;
    const path_levels = path.split('/');

    // const subPath = path_levels.splice(path_levels.length - 2)
    const internal = parseInt(path_levels[path_levels.length - 2]) === 1 ? true : false;
    const childIndex = parseInt(path_levels[path_levels.length - 1]);

    const network = WalletUtilities.getNetworkByType(wallet.networkType);
    const { privateKey } = WalletUtilities.getPrivateKeyByIndex(
      wallet.specs.xpriv,
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
