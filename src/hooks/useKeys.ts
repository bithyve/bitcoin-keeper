import { RealmSchema } from 'src/storage/realm/enum';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';

const useKeys = () => {
  const keys: VaultSigner[] = useQuery(RealmSchema.VaultSigner).map(getJSONFromRealmObject);
  return { keys };
};

export default useKeys;
