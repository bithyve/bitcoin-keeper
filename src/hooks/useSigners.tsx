import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getKeyUID } from 'src/utils/utilities';
import { useAppSelector } from 'src/store/hooks';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { NetworkType } from 'src/services/wallets/enums';

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

  // filter signers based on xpub and derivation path
  signers = signers.map(getJSONFromRealmObject);
  if (!getAll) {
    signers = signers.filter((signer: any) => {
      let isCorrectChain = false;
      for (const xPubObject of Object.values(signer.signerXpubs)) {
        if (xPubObject.length == 0 || isCorrectChain) continue;
        const { derivationPath, xpub } = xPubObject[0];
        const chainIndex =
          parseInt(derivationPath.replaceAll("'", '').split('/')[2]) == 0
            ? NetworkType.MAINNET
            : NetworkType.TESTNET;
        const chainType = WalletUtilities.getNetworkFromPrefix(xpub.slice(0, 4));
        if (chainIndex === chainType && chainType === bitcoinNetworkType) isCorrectChain = true;
      }
      return isCorrectChain;
    });
  }

  return { vaultSigners, signers };
};

export default useSigners;
