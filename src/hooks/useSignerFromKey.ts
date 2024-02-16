import { Signer, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const useSignerFromKey = (key: VaultSigner) => {
  const signerQuery = useQuery(RealmSchema.Signer);
  if (!key) return { signer: null };
  const signer: Signer = signerQuery
    .filtered(`masterFingerprint == "${key.masterFingerprint}"`)
    .map(getJSONFromRealmObject)[0];
  return { signer };
};

export default useSignerFromKey;
