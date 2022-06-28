import crypto from 'crypto';
import { NetworkType, VaultType, VisibilityType } from '../enums';
import {
  Vault,
  VaultPresentationData,
  VaultScheme,
  VaultSigner,
  VaultSpecs,
} from '../interfaces/vault';

export const generateVault = async ({
  type,
  vaultShellId,
  vaultName,
  vaultDescription,
  scheme,
  signers,
  networkType,
}: {
  type: VaultType;
  vaultShellId: string;
  vaultName: string;
  vaultDescription: string;
  scheme: VaultScheme;
  signers: VaultSigner[];
  networkType: NetworkType;
}): Promise<Vault> => {
  const xpubs = signers.map((signer) => signer.xpub);
  const id = crypto.createHash('sha256').update(xpubs.join('')).digest('hex');

  const presentationData: VaultPresentationData = {
    vaultName,
    vaultDescription,
    vaultVisibility: VisibilityType.DEFAULT,
  };

  const specs: VaultSpecs = {
    xpubs: xpubs,
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
  };

  const vault: Vault = {
    id,
    vaultShellId,
    type,
    networkType,
    isUsable: true,
    isMultiSig: true,
    scheme,
    signers,
    presentationData,
    specs,
  };

  return vault;
};
