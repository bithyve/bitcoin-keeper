import { Signer, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getKeyUID } from 'src/utils/utilities';

const useSignerFromKey = (key: VaultSigner) => {
  const signerQuery = useQuery(RealmSchema.Signer);
  if (!key) return { signer: null };
  const signer: Signer = signerQuery
    .filtered(`masterFingerprint == "${key.masterFingerprint}"`)
    .map(getJSONFromRealmObject)
    .find((s) => getKeyUID(s as Signer) === getKeyUID(key));
  return { signer };
};

export default useSignerFromKey;
