import { Signer, Vault } from 'src/core/wallets/interfaces/vault';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const useSigners = ({ vault }: { vault: Vault }) => {
  const allSigners: Signer[] = useQuery(RealmSchema.Signer).map(getJSONFromRealmObject);
  if (!vault) return { signers: [] };
  const keys = vault.signers;
  const signers: Signer[] = [];
  keys.forEach((key) => {
    const signer = allSigners.find((signer) => signer.masterFingerprint === key.masterFingerprint);
    signers.push(signer);
  });

  return { signers };
};

export default useSigners;
