import crypto from 'crypto';
import WalletUtilities from '../operations/utils';
import * as bip39 from 'bip39';
import BIP85 from '../operations/BIP85';
import { WalletType, DerivationPurpose, NetworkType, WalletVisibility } from '../enums';
import {
  Wallet,
  WalletDerivationDetails,
  WalletPresentationData,
  WalletSpecs,
} from '../interfaces/wallet';
import { BIP85Config } from '../interfaces';

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
}): Promise<Wallet> => {
  const network = WalletUtilities.getNetworkByType(networkType);

  let xpriv: string, xpub: string, id: string, derivationDetails: WalletDerivationDetails;

  switch (type) {
    case WalletType.READ_ONLY:
      xpub = importedXpub;
      id = crypto.createHash('sha256').update(xpub).digest('hex');
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

      id = crypto.createHash('sha256').update(mnemonic).digest('hex');
      // derive extended keys
      const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');
      const xDerivationPath = WalletUtilities.getDerivationPath(networkType);
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
    walletName,
    walletDescription,
    walletVisibility: WalletVisibility.DEFAULT,
  };

  const purpose = [WalletType.SWAN, WalletType.IMPORTED, WalletType.READ_ONLY].includes(type)
    ? DerivationPurpose.BIP84
    : DerivationPurpose.BIP49;

  const specs: WalletSpecs = {
    xpub,
    xpriv,
    activeAddresses: {
      external: {},
      internal: {},
    },
    importedAddresses: {},
    receivingAddress: WalletUtilities.getAddressByIndex(xpub, false, 0, network, purpose),
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
    transactionsNote: {},
  };

  const wallet: Wallet = {
    id,
    walletShellId,
    type,
    networkType,
    isUsable: true,
    derivationDetails,
    presentationData,
    specs,
  };
  return wallet;
};
