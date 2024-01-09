import { RealmSchema } from 'src/storage/realm/enum';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import useCollaborativeWallet from './useCollaborativeWallet';
import { useQuery } from '@realm/react';

type Params =
  | {
      collaborativeWalletId?: string;
      vaultId: string;
    }
  | {
      collaborativeWalletId: string;
      vaultId?: string;
    }
  | { collaborativeWalletId?: string; vaultId?: string };

const useVault = ({ collaborativeWalletId = '', vaultId = '' }: Params) => {
  const { collaborativeWallet } = useCollaborativeWallet(collaborativeWalletId);
  const allVaults: Vault[] = useQuery(RealmSchema.Vault).map(getJSONFromRealmObject);

  if (!collaborativeWalletId && !vaultId) {
    return { allVaults, activeVault: allVaults[0] };
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
