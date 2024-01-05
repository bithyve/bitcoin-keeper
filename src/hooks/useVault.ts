import { RealmSchema } from 'src/storage/realm/enum';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { VaultType } from 'src/core/wallets/enums';
import useCollaborativeWallet from './useCollaborativeWallet';
import { useQuery } from '@realm/react';

const useVault = (collaborativeWalletId?: string) => {
  const { collaborativeWallet } = useCollaborativeWallet(collaborativeWalletId);
  if (collaborativeWallet) {
    return { activeVault: collaborativeWallet };
  }

  const activeVault: Vault =
    useQuery(RealmSchema.Vault)
      .map(getJSONFromRealmObject)
      .filter((vault: Vault) => !vault.archived && vault.type !== VaultType.COLLABORATIVE)[0] ||
    null;

  return { activeVault };
};

export default useVault;
