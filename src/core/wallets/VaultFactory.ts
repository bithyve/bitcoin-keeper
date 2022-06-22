import { DerivationPurpose, NetworkType, WalletVisibility } from './interfaces/enum';
import {
  Vault,
  VaultDerivationDetails,
  VaultPresentationData,
  VaultScheme,
  VaultSigner,
  VaultSpecs,
} from './interfaces/interface';

import WalletUtilities from './WalletUtilities';
import crypto from 'crypto';

export const generateVault = async ({
  scheme,
  signers,
  vaultShellId,
  vaultName,
  vaultDescription,
  xpubs,
  networkType,
}: {
  scheme: VaultScheme;
  signers: VaultSigner[];
  vaultShellId: string;
  vaultName: string;
  vaultDescription: string;
  xpubs: string[];
  networkType: NetworkType;
}): Promise<Vault> => {
  const network = WalletUtilities.getNetworkByType(networkType);

  let initialRecevingAddress = '';
  let isUsable = false;

  if (xpubs.length > 1) {
    initialRecevingAddress = WalletUtilities.createMultiSig(
      xpubs,
      scheme.m,
      network,
      0,
      false
    ).address;
    isUsable = true;
  } else {
    initialRecevingAddress = WalletUtilities.getAddressByIndex(
      xpubs[0],
      false,
      0,
      network,
      DerivationPurpose.BIP49
    );
  }

  const derivationDetails: VaultDerivationDetails = {};
  signers.map((signer) => (derivationDetails[signer.xpub] = { derivationPath: signer.derivation }));

  const id = crypto
    .createHash('sha256')
    .update(signers.map((signer) => signer.signerId).join(' '))
    .digest('hex');

  const presentationData: VaultPresentationData = {
    vaultName,
    vaultDescription,
    vaultVisibility: WalletVisibility.DEFAULT, // visibility of the vault
    isSynching: false,
  };

  const specs: VaultSpecs = {
    is2FA: true,
    xpub: xpubs,
    activeAddresses: {
      external: {},
      internal: {},
    },
    importedAddresses: {},
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
    txIdCache: {},
    transactionMapping: [],
    transactionsNote: {},
  };

  const vault: Vault = {
    id,
    scheme,
    vaultShellId,
    isUsable,
    signers,
    presentationData,
    specs,
  };

  return vault;
};
