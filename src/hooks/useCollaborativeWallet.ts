import { RealmSchema } from 'src/storage/realm/enum';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { VaultType } from 'src/core/wallets/enums';
import { useQuery } from '@realm/react';

const useCollaborativeWallet = () => {
  const queryFilter = `type == "${VaultType.COLLABORATIVE}"`;

  const collaborativeWallets: Vault[] = useQuery(RealmSchema.Vault).filtered(queryFilter);

  if (!collaborativeWallets || !collaborativeWallets.length) {
    return { collaborativeWallets: [] };
  }

  return {
    collaborativeWallets: collaborativeWallets.map(getJSONFromRealmObject) as Vault[],
  };
};

export default useCollaborativeWallet;
