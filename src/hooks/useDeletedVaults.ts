import { RealmSchema } from 'src/storage/realm/enum';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';

const useDeletedVault = () => {
  const deletedVaults: Vault[] = useQuery(RealmSchema.Vault, (collection) =>
    collection.filtered('archived == true && archivedId == null')
  ).map(getJSONFromRealmObject);

  return { deletedVaults };
};

export default useDeletedVault;
