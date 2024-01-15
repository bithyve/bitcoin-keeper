import { RealmSchema } from 'src/storage/realm/enum';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import useCollaborativeWallet from './useCollaborativeWallet';
import { useQuery } from '@realm/react';

type Params =
  | {
      collaborativeWalletId?: string;
      vaultId: string;
      includeArchived?: boolean;
      getFirst?: boolean;
    }
  | {
      collaborativeWalletId: string;
      vaultId?: string;
      includeArchived?: boolean;
      getFirst?: boolean;
    }
  | {
      collaborativeWalletId?: string;
      vaultId?: string;
      includeArchived?: boolean;
      getFirst?: boolean;
    };

const useVault = ({
  collaborativeWalletId = '',
  vaultId = '',
  includeArchived = true,
  getFirst = false,
}: Params) => {
  const { collaborativeWallet } = useCollaborativeWallet(collaborativeWalletId);
  let allVaults: Vault[] = useQuery(RealmSchema.Vault);

  allVaults = includeArchived
    ? allVaults.map(getJSONFromRealmObject)
    : allVaults.filtered('archived != true').map(getJSONFromRealmObject);

  if (!collaborativeWalletId && !vaultId) {
    return { allVaults, activeVault: getFirst ? allVaults[0] : null };
  }

  if (collaborativeWallet) {
    return { activeVault: collaborativeWallet, allVaults };
  }

  const activeVault: Vault = vaultId
    ? allVaults.filter((v) => v.id === vaultId)[0]
    : allVaults.filter((v) => !v.archived)[0];

  return { activeVault, allVaults };
};

export default useVault;
