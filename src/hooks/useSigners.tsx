import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getKeyUID } from 'src/utils/utilities';
import { useAppSelector } from 'src/store/hooks';

const useSigners = (vaultId = '', getAll = true): { vaultSigners: Signer[]; signers: Signer[] } => {
  const vaults = useQuery(RealmSchema.Vault);
  let signers: any = useQuery(RealmSchema.Signer);
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);
  let currentVault = null;
  const vaultSigners = [];
  if (vaultId) {
    currentVault = vaults.filtered(`id == "${vaultId}"`)[0];
    const vaultKeys = (currentVault as Vault)?.signers;
    vaultKeys?.forEach((key) => {
      const signer = signers
        .filtered(`masterFingerprint == "${key.masterFingerprint}"`)
        .find((s) => getKeyUID(s as Signer) === getKeyUID(key));
      if (signer) {
        vaultSigners.push(signer.toJSON());
      }
    });
    return { vaultSigners, signers: signers.map(getJSONFromRealmObject) };
  }

  signers = signers.map(getJSONFromRealmObject);
  if (!getAll) {
    signers = signers.filter((signer: any) => signer.networkType === bitcoinNetworkType);
  }

  return { vaultSigners, signers };
};

export default useSigners;
