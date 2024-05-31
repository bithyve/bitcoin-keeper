import { RealmSchema } from 'src/storage/realm/enum';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';
import { VaultType, VisibilityType } from 'src/services/wallets/enums';

type Params = {
  vaultId?: string;
  getAll?: boolean;
};

const useCanaryVault = ({ vaultId = '', getAll = true }: Params) => {
  let allVaults: Vault[] = useQuery(RealmSchema.Vault);
  allVaults = allVaults.filtered('archived != true').map(getJSONFromRealmObject);

  const allNonHiddenNonArchivedCanaryVaults = allVaults.filter(
    (vault) =>
      vault.presentationData.visibility === VisibilityType.DEFAULT &&
      vault.type === VaultType.CANARY
  );
  if (getAll) {
    return {
      allCanaryVaults: allNonHiddenNonArchivedCanaryVaults,
    };
  }
  if (vaultId) {
    const canaryVault = allNonHiddenNonArchivedCanaryVaults.some((vault) => vault.id === vaultId);
    return { canaryVault };
  }
};

export default useCanaryVault;
