import crypto from 'crypto';
import AccountUtilities from './AccountUtilities';
import * as bip39 from 'bip39';
import BIP85 from './BIP85';
import { AccountType, DerivationPurpose, NetworkType } from './interfaces/enum';
import {
  Account,
  AccountDerivationDetails,
  AccountPresentationData,
  AccountSpecs,
  BIP85Config,
  DonationAccount,
  DonationAccountPresentationData,
  LightningNode,
  MultiSigAccount,
  MultiSigAccountSpecs,
} from './interfaces/interface';
import AccountVisibility from 'src/common/data/enums/AccountVisibility';

export const generateAccount = async ({
  type,
  instanceNum,
  accountName,
  accountDescription,
  primaryMnemonic,
  networkType,
  node,
}: {
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

  const derivationDetails: AccountDerivationDetails = {
    networkType,
    instanceNum,
    mnemonic,
    bip85Config,
    xDerivationPath,
  };

  const presentationData: AccountPresentationData = {
    accountName,
    accountDescription,
    accountVisibility: AccountVisibility.DEFAULT,
    isSynching: false,
  };

  const specs: AccountSpecs = {
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
    node: type === AccountType.LIGHTNING_ACCOUNT ? node : null,
  };

  const account: Account = {
    id,
    type,
    isUsable: true,
    derivationDetails,
    presentationData,
    specs,
  };
  return account;
};

export const generateMultiSigAccount = async ({
  type,
  instanceNum,
  accountName,
  accountDescription,
  primaryMnemonic,
  secondaryXpub,
  bithyveXpub,
  networkType,
}: {
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

  const derivationDetails: AccountDerivationDetails = {
    networkType,
    instanceNum,
    mnemonic,
    bip85Config,
    xDerivationPath,
  };

  const presentationData: AccountPresentationData = {
    accountName,
    accountDescription,
    accountVisibility: AccountVisibility.DEFAULT,
    isSynching: false,
  };

  const specs: MultiSigAccountSpecs = {
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

  const multiSigAccount: MultiSigAccount = {
    id,
    isUsable,
    type,
    derivationDetails,
    presentationData,
    specs,
  };

  return multiSigAccount;
};

export const generateDonationAccount = async ({
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
  if (is2FA) {
    baseAccount = await generateMultiSigAccount({
      type,
      instanceNum,
      accountName,
      accountDescription,
      primaryMnemonic,
      secondaryXpub,
      bithyveXpub,
      networkType,
    });
  } else {
    baseAccount = await generateAccount({
      type,
      instanceNum,
      accountName,
      accountDescription,
      primaryMnemonic,
      networkType,
    });
  }

  const presentationData: DonationAccountPresentationData = {
    ...baseAccount.presentationData,
    donationName,
    donationDescription,
    donee,
    configuration: {
      displayBalance: true,
      displayIncomingTxs: true,
      displayOutgoingTxs: true,
    },
    disableAccount: false,
  };

  const donationAccount: DonationAccount = {
    ...baseAccount,
    presentationData,
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
  (account as MultiSigAccount).specs.xpubs = {
    secondary: secondaryXpub,
    bithyve: bithyveXpub,
  };
  (account as MultiSigAccount).specs.is2FA = true;
  (account as MultiSigAccount).specs.xprivs = {};

  const network = AccountUtilities.getNetworkByType(account.derivationDetails.networkType);
  account.specs.receivingAddress = AccountUtilities.createMultiSig(
    {
      primary: account.specs.xpub,
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
