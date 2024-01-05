import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { Signer } from 'src/core/wallets/interfaces/vault';

const useSignerMap = () => {
  const signerMap = {};
  const signerQuery = useQuery(RealmSchema.Signer);
  signerQuery.forEach(
    (signer) => (signerMap[(signer.toJSON() as Signer).masterFingerprint] = signer)
  );
  return { signerMap };
};

export default useSignerMap;
