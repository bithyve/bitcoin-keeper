import crypto from 'crypto';
import AccountUtilities from './AccountUtilities';
import * as bip39 from 'bip39';
import BIP85 from './BIP85';
import { AccountType, DerivationPurpose, NetworkType } from './interfaces/enum';
import {
  Account,
  BIP85Config,
  DonationAccount,
  LightningNode,
  MultiSigAccount,
} from './interfaces/interface';
import AccountVisibility from 'src/common/data/enums/AccountVisibility';

export const generateAccount = async ({
  walletId,
  type,
  instanceNum,
  accountName,
  accountDescription,
  primaryMnemonic,
  networkType,
  node,
}: {
  walletId: string;
  type: AccountType;
  instanceNum: number;
  accountName: string;
  accountDescription: string;
  primaryMnemonic: string;
  networkType: NetworkType;
  node?: LightningNode;
}): Promise<Account> => {
  const network = AccountUtilities.getNetworkByType(networkType);

  // BIP85 derivation: primary mnemonic to bip85-child mnemonic
  const bip85Config: BIP85Config = BIP85.generateBIP85Configuration(type, instanceNum);
  const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);
  const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);

  const id = crypto.createHash('sha256').update(mnemonic).digest('hex');

  // derive extended keys
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');
  const xDerivationPath = AccountUtilities.getDerivationPath(networkType);
  const { xpriv, xpub } = AccountUtilities.generateExtendedKeyPairFromSeed(
    seed,
    network,
    xDerivationPath
  );

  const purpose = [AccountType.SWAN_ACCOUNT, AccountType.IMPORTED_ACCOUNT].includes(type)
    ? DerivationPurpose.BIP84
    : DerivationPurpose.BIP49;
  const initialRecevingAddress = AccountUtilities.getAddressByIndex(
    xpub,
    false,
    0,
    network,
    purpose
  );

  const account: Account = {
    id,
    isUsable: true,
    walletId,
    type,
    instanceNum,
    networkType,
    mnemonic,
    bip85Config,
    xDerivationPath,
    xpub,
    xpriv,
    accountName,
    accountDescription,
    accountVisibility: AccountVisibility.DEFAULT,
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

  if (type === AccountType.LIGHTNING_ACCOUNT) account.node = node;
  return account;
};

export const generateMultiSigAccount = async ({
  walletId,
  type,
  instanceNum,
  accountName,
  accountDescription,
  primaryMnemonic,
  secondaryXpub,
  bithyveXpub,
  networkType,
}: {
  walletId: string;
  type: AccountType;
  instanceNum: number;
  accountName: string;
  accountDescription: string;
  primaryMnemonic: string;
  secondaryXpub?: string;
  bithyveXpub?: string;
  networkType: NetworkType;
}): Promise<MultiSigAccount> => {
  const network = AccountUtilities.getNetworkByType(networkType);

  // BIP85 derivation: primary mnemonic to bip85-child mnemonic
  const bip85Config: BIP85Config = BIP85.generateBIP85Configuration(type, instanceNum);
  const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);
  const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);

  const id = crypto.createHash('sha256').update(mnemonic).digest('hex');

  // derive extended keys
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');
  const xDerivationPath = AccountUtilities.getDerivationPath(networkType);
  const { xpriv: primaryXpriv, xpub: primaryXpub } =
    AccountUtilities.generateExtendedKeyPairFromSeed(seed, network, xDerivationPath);

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
    initialRecevingAddress = AccountUtilities.createMultiSig(
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

  const account: MultiSigAccount = {
    id,
    isUsable,
    walletId,
    type,
    instanceNum,
    networkType,
    mnemonic,
    bip85Config,
    xDerivationPath,
    is2FA: true,
    xpub: primaryXpub,
    xpriv: primaryXpriv,
    xpubs,
    xprivs,
    accountName,
    accountDescription,
    accountVisibility: AccountVisibility.DEFAULT,
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

  return account;
};

export const generateDonationAccount = async ({
  walletId,
  type,
  instanceNum,
  accountName,
  accountDescription,
  donationName,
  donationDescription,
  donee,
  primaryMnemonic,
  is2FA,
  secondaryXpub,
  bithyveXpub,
  networkType,
}: {
  walletId: string;
  type: AccountType;
  instanceNum: number;
  accountName: string;
  accountDescription: string;
  donationName: string;
  donationDescription: string;
  donee: string;
  primaryMnemonic: string;
  is2FA?: boolean;
  secondaryXpub?: string;
  bithyveXpub?: string;
  networkType: NetworkType;
}): Promise<DonationAccount> => {
  let baseAccount: Account | MultiSigAccount;
  if (is2FA)
    baseAccount = await generateMultiSigAccount({
      walletId,
      type,
      instanceNum,
      accountName,
      accountDescription,
      primaryMnemonic,
      secondaryXpub,
      bithyveXpub,
      networkType,
    });
  else {
    baseAccount = await generateAccount({
      walletId,
      type,
      instanceNum,
      accountName,
      accountDescription,
      primaryMnemonic,
      networkType,
    });
  }

  const donationAccount: DonationAccount = {
    ...baseAccount,
    donationName,
    donationDescription,
    donee,
    configuration: {
      displayBalance: true,
      displayIncomingTxs: true,
      displayOutgoingTxs: true,
    },
    disableAccount: false,
    is2FA,
  };

  return donationAccount;
};

export const upgradeAccountToMultiSig = ({
  account,
  secondaryXpub,
  bithyveXpub,
}: {
  account: Account;
  secondaryXpub: string;
  bithyveXpub: string;
}): MultiSigAccount => {
  account.isUsable = true;
  (account as MultiSigAccount).xpubs = {
    secondary: secondaryXpub,
    bithyve: bithyveXpub,
  };
  (account as MultiSigAccount).is2FA = true;
  (account as MultiSigAccount).xprivs = {};

  const network = AccountUtilities.getNetworkByType(account.networkType);
  account.receivingAddress = AccountUtilities.createMultiSig(
    {
      primary: account.xpub,
      secondary: secondaryXpub,
      bithyve: bithyveXpub,
    },
    2,
    network,
    0,
    false
  ).address;

  return account as MultiSigAccount;
};
