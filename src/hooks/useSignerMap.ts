import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { Signer } from 'src/services/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getKeyUID } from 'src/utils/utilities';
import { useAppSelector } from 'src/store/hooks';

const useSignerMap = () => {
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);
  const signerMap = {};
  const signerQuery = useQuery(RealmSchema.Signer).filter(
    (signer: unknown) => (signer as Signer).networkType === bitcoinNetworkType
  );
  signerQuery.forEach(
    (signer: unknown) => (signerMap[getKeyUID(signer as Signer)] = getJSONFromRealmObject(signer))
  );
  return { signerMap };
};

export default useSignerMap;
