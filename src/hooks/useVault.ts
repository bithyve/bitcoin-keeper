import { RealmSchema } from 'src/storage/realm/enum';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';
import { VisibilityType } from 'src/core/wallets/enums';

type Params =
  | {
      collaborativeWalletId?: string;
      vaultId: string;
      includeArchived?: boolean;
      getFirst?: boolean;
      getHiddenWallets?: boolean;
    }
  | {
      collaborativeWalletId: string;
      vaultId?: string;
      includeArchived?: boolean;
      getFirst?: boolean;
      getHiddenWallets?: boolean;
    }
  | {
      collaborativeWalletId?: string;
      vaultId?: string;
      includeArchived?: boolean;
      getFirst?: boolean;
      getHiddenWallets?: boolean;
    };

const useVault = ({
  vaultId = '',
  includeArchived = true,
  getFirst = false,
  getHiddenWallets = true,
}: Params) => {
  let allVaults: Vault[] = useQuery(RealmSchema.Vault);
  allVaults = includeArchived
    ? allVaults.map(getJSONFromRealmObject)
    : allVaults.filtered('archived != true').map(getJSONFromRealmObject);

  const allNonHiddenNonArchivedVaults = allVaults.filter(
    (vault) => vault.presentationData.visibility === VisibilityType.DEFAULT
  );
  if (!vaultId) {
    if (getHiddenWallets) {
      return { allVaults, activeVault: getFirst ? allVaults[0] : null };
    } else {
      return {
        allVaults: allNonHiddenNonArchivedVaults,
        activeVault: getFirst ? allVaults[0] : null,
      };
    }
  }

  const activeVault: Vault = vaultId
    ? allVaults.filter((v) => v.id === vaultId)[0]
    : allVaults.filter((v) => !v.archived)[0];

  if (!getHiddenWallets) {
    return { activeVault, allVaults: allNonHiddenNonArchivedVaults };
  } else {
    return { activeVault, allVaults };
  }
};

export default useVault;
