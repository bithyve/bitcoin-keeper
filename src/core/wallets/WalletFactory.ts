import crypto from 'crypto';
import WalletUtilities from './WalletUtilities';
import * as bip39 from 'bip39';
import BIP85 from './BIP85';
import { WalletType, DerivationPurpose, NetworkType, WalletVisibility } from './interfaces/enum';
import {
  Wallet,
  WalletDerivationDetails,
  WalletPresentationData,
  WalletSpecs,
  BIP85Config,
  DonationWallet,
  DonationWalletPresentationData,
  MultiSigWallet,
  MultiSigWalletSpecs,
} from './interfaces/interface';

export const generateWallet = async ({
  type,
  instanceNum,
  walletShellId,
  walletName,
  walletDescription,
  primaryMnemonic,
  networkType,
}: {
  type: WalletType;
  instanceNum: number;
  walletShellId: string;
  walletName: string;
  walletDescription: string;
  primaryMnemonic: string;
  networkType: NetworkType;
}): Promise<Wallet> => {
  const network = WalletUtilities.getNetworkByType(networkType);

  // BIP85 derivation: primary mnemonic to bip85-child mnemonic
  const bip85Config: BIP85Config = BIP85.generateBIP85Configuration(type, instanceNum);
  const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);
  const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);

  const id = crypto.createHash('sha256').update(mnemonic).digest('hex');

  // derive extended keys
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');
  const xDerivationPath = WalletUtilities.getDerivationPath(networkType);
  const { xpriv, xpub } = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed,
    network,
    xDerivationPath
  );

  const purpose = [WalletType.SWAN, WalletType.IMPORTED].includes(type)
    ? DerivationPurpose.BIP84
    : DerivationPurpose.BIP49;
  const initialRecevingAddress = WalletUtilities.getAddressByIndex(
    xpub,
    false,
    0,
    network,
    purpose
  );

  const derivationDetails: WalletDerivationDetails = {
    networkType,
    instanceNum,
    mnemonic,
    bip85Config,
    xDerivationPath,
  };

  const presentationData: WalletPresentationData = {
    walletName,
    walletDescription,
    walletVisibility: WalletVisibility.DEFAULT,
    isSynching: false,
  };

  const specs: WalletSpecs = {
    xpub,
    xpriv,
    activeAddresses: {
      external: {},
      internal: {},
    },
    receivingAddress: initialRecevingAddress,
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
    txIdMap: {},
    transactionsNote: {},
    importedAddresses: {},
  };

  const wallet: Wallet = {
    id,
    type,
    walletShellId,
    isUsable: true,
    derivationDetails,
    presentationData,
    specs,
  };
  return wallet;
};

export const generateMultiSigWallet = async ({
  type,
  instanceNum,
  walletShellId,
  walletName,
  walletDescription,
  primaryMnemonic,
  secondaryXpub,
  bithyveXpub,
  networkType,
}: {
  type: WalletType;
  instanceNum: number;
  walletShellId: string;
  walletName: string;
  walletDescription: string;
  primaryMnemonic: string;
  secondaryXpub?: string;
  bithyveXpub?: string;
  networkType: NetworkType;
}): Promise<MultiSigWallet> => {
  const network = WalletUtilities.getNetworkByType(networkType);

  // BIP85 derivation: primary mnemonic to bip85-child mnemonic
  const bip85Config: BIP85Config = BIP85.generateBIP85Configuration(type, instanceNum);
  const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);
  const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);

  const id = crypto.createHash('sha256').update(mnemonic).digest('hex');

  // derive extended keys
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');
  const xDerivationPath = WalletUtilities.getDerivationPath(networkType);
  const { xpriv: primaryXpriv, xpub: primaryXpub } =
    WalletUtilities.generateExtendedKeyPairFromSeed(seed, network, xDerivationPath);

  const xpubs: {
    secondary: string;
    bithyve: string;
  } = {
    secondary: secondaryXpub,
    bithyve: bithyveXpub,
  };
  const xprivs: {
    secondary?: string;
  } = {};

  let initialRecevingAddress = '';
  let isUsable = false;

  if (secondaryXpub) {
    initialRecevingAddress = WalletUtilities.createMultiSig(
      {
        primary: primaryXpub,
        ...xpubs,
      },
      2,
      network,
      0,
      false
    ).address;
    isUsable = true;
  }

  const derivationDetails: WalletDerivationDetails = {
    networkType,
    instanceNum,
    mnemonic,
    bip85Config,
    xDerivationPath,
  };

  const presentationData: WalletPresentationData = {
    walletName,
    walletDescription,
    walletVisibility: WalletVisibility.DEFAULT,
    isSynching: false,
  };

  const specs: MultiSigWalletSpecs = {
    is2FA: true,
    xpub: primaryXpub,
    xpriv: primaryXpriv,
    xpubs,
    xprivs,
    activeAddresses: {
      external: {},
      internal: {},
    },
    receivingAddress: initialRecevingAddress,
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
    txIdMap: {},
    transactionsNote: {},
    importedAddresses: {},
  };

  const multiSigWallet: MultiSigWallet = {
    id,
    isUsable,
    walletShellId,
    type,
    derivationDetails,
    presentationData,
    specs,
  };

  return multiSigWallet;
};

export const generateDonationWallet = async ({
  type,
  instanceNum,
  walletShellId,
  walletName,
  walletDescription,
  donationName,
  donationDescription,
  donee,
  primaryMnemonic,
  is2FA,
  secondaryXpub,
  bithyveXpub,
  networkType,
}: {
  type: WalletType;
  instanceNum: number;
  walletShellId: string;
  walletName: string;
  walletDescription: string;
  donationName: string;
  donationDescription: string;
  donee: string;
  primaryMnemonic: string;
  is2FA?: boolean;
  secondaryXpub?: string;
  bithyveXpub?: string;
  networkType: NetworkType;
}): Promise<DonationWallet> => {
  let baseWallet: Wallet | MultiSigWallet;
  if (is2FA) {
    baseWallet = await generateMultiSigWallet({
      type,
      instanceNum,
      walletShellId,
      walletName,
      walletDescription,
      primaryMnemonic,
      secondaryXpub,
      bithyveXpub,
      networkType,
    });
  } else {
    baseWallet = await generateWallet({
      type,
      instanceNum,
      walletShellId,
      walletName,
      walletDescription,
      primaryMnemonic,
      networkType,
    });
  }

  const presentationData: DonationWalletPresentationData = {
    ...baseWallet.presentationData,
    donationName,
    donationDescription,
    donee,
    configuration: {
      displayBalance: true,
      displayIncomingTxs: true,
      displayOutgoingTxs: true,
    },
    disableWallet: false,
  };

  const donationWallet: DonationWallet = {
    ...baseWallet,
    presentationData,
  };

  return donationWallet;
};

export const upgradeWalletToMultiSig = ({
  wallet,
  secondaryXpub,
  bithyveXpub,
}: {
  wallet: Wallet;
  secondaryXpub: string;
  bithyveXpub: string;
}): MultiSigWallet => {
  wallet.isUsable = true;
  (wallet as MultiSigWallet).specs.xpubs = {
    secondary: secondaryXpub,
    bithyve: bithyveXpub,
  };
  (wallet as MultiSigWallet).specs.is2FA = true;
  (wallet as MultiSigWallet).specs.xprivs = {};

  const network = WalletUtilities.getNetworkByType(wallet.derivationDetails.networkType);
  wallet.specs.receivingAddress = WalletUtilities.createMultiSig(
    {
      primary: wallet.specs.xpub,
      secondary: secondaryXpub,
      bithyve: bithyveXpub,
    },
    2,
    network,
    0,
    false
  ).address;

  return wallet as MultiSigWallet;
};
