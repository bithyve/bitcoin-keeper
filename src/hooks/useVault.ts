import { useContext } from 'react';

import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { VaultType } from 'src/core/wallets/enums';

const useVault = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const activeVault: Vault =
    useQuery(RealmSchema.Vault)
      .map(getJSONFromRealmObject)
      .filter((vault: Vault) => !vault.archived && vault.type !== VaultType.COLLABORATIVE)[0] ||
    null;
  return { activeVault };
};

export default useVault;
