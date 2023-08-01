import { useContext } from 'react';

import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { VaultType } from 'src/core/wallets/enums';

const useCollaborativeWallet = ({ walletId }: { walletId: string }) => {
  const { useQuery } = useContext(RealmWrapperContext);
  const collaborativeWallet: Vault =
    useQuery(RealmSchema.Vault)
      .filtered(`type == "${VaultType.COLLABORATIVE}" && collaborativeWalletId == "${walletId}"`)
      .map(getJSONFromRealmObject) || null;
  return { collaborativeWallet };
};

export default useCollaborativeWallet;
