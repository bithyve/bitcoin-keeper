import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { Signer } from 'src/services/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getKeyUID } from 'src/utils/utilities';

const useSignerMap = () => {
  const signerMap = {};
  const signerQuery = useQuery(RealmSchema.Signer);
  signerQuery.forEach(
    (signer) => (signerMap[getKeyUID(signer as Signer)] = getJSONFromRealmObject(signer))
  );
  return { signerMap };
};

export default useSignerMap;
