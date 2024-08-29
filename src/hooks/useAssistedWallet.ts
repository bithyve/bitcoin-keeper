import { RealmSchema } from 'src/storage/realm/enum';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { VaultType } from 'src/services/wallets/enums';
import { useQuery } from '@realm/react';

const useAssistedWallet = () => {
  const queryFilter = `type == "${VaultType.ASSISTED}"`;

  const assistedWallets: Vault[] = useQuery(RealmSchema.Vault).filtered(queryFilter);

  if (!assistedWallets || !assistedWallets.length) {
    return { assistedWallets: [] };
  }

  return {
    assistedWallets: assistedWallets.map(getJSONFromRealmObject) as Vault[],
  };
};

export default useAssistedWallet;
