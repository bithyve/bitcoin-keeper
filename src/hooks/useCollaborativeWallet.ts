import { useContext } from 'react';

import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { VaultType } from 'src/core/wallets/enums';

const useCollaborativeWallet = ({ walletId }: { walletId: string }) => {
  const { useQuery } = useContext(RealmWrapperContext);
  const collaborativeWallets: Vault[] = useQuery(RealmSchema.Vault).filtered(
    `type == "${VaultType.COLLABORATIVE}" && collaborativeWalletId == "${walletId}"`
  );
  if (!collaborativeWallets || !collaborativeWallets.length) {
    return { collaborativeWallet: null };
  }
  return { collaborativeWallet: collaborativeWallets.map(getJSONFromRealmObject)[0] };
};

export default useCollaborativeWallet;
