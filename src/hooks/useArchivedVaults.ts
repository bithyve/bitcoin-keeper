import { RealmSchema } from 'src/storage/realm/enum';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';

const useArchivedVault = () => {
  const archivedVaults: Vault[] = useQuery(RealmSchema.Vault, (collection) =>
    collection.filtered('archived == true')
  ).map(getJSONFromRealmObject);

  return { archivedVaults };
};

export default useArchivedVault;
