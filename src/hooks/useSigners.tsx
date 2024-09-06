import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const useSigners = (vaultId = ''): { vaultSigners: Signer[]; signers: Signer[] } => {
  const vaults = useQuery(RealmSchema.Vault);
  const signers = useQuery(RealmSchema.Signer);
  let currentVault = null;
  const vaultSigners = [];
  if (vaultId) {
    currentVault = vaults.filtered(`id == "${vaultId}"`)[0];
    const vaultKeys = (currentVault as Vault)?.signers;
    vaultKeys?.forEach((key) => {
      const signer = signers.filtered(`masterFingerprint == "${key.masterFingerprint}"`)[0];
      vaultSigners.push(signer.toJSON());
    });
    return { vaultSigners, signers: signers.map(getJSONFromRealmObject) };
  }
  return { vaultSigners, signers: signers.map(getJSONFromRealmObject) };
};

export default useSigners;
