import { hash256 } from 'src/core/services/operations/encryption';
import { EntityKind, NetworkType, VaultType, VisibilityType } from '../enums';
import {
  Vault,
  VaultPresentationData,
  VaultScheme,
  VaultSigner,
  VaultSpecs,
} from '../interfaces/vault';

export const generateVault = ({
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
}): Vault => {
  const xpubs = signers.map((signer) => signer.xpub);
  const id = hash256(xpubs.join(''));

  const presentationData: VaultPresentationData = {
    name: vaultName,
    description: vaultDescription,
    visibility: VisibilityType.DEFAULT,
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
    entityKind: EntityKind.VAULT,
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
