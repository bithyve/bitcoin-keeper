import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { Signer } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const useSignerMap = () => {
  const signerMap = {};
  const signerQuery = useQuery(RealmSchema.Signer);
  signerQuery.forEach(
    (signer) => (signerMap[(signer as Signer).masterFingerprint] = getJSONFromRealmObject(signer))
  );
  return { signerMap };
};

export default useSignerMap;
