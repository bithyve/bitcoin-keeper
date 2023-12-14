import { Vault } from 'src/core/wallets/interfaces/vault';
import { RealmSchema } from './enum';
import WalletUtilities from 'src/core/wallets/operations/utils';

export const runRealmMigrations = ({ oldRealm, newRealm }) => {
  // vault migrations for seggregated key management
  if (oldRealm.schemaVersion < 63) {
    const oldVaults = oldRealm.objects(RealmSchema.Vault) as any;
    const newVaults = newRealm.objects(RealmSchema.Vault) as Vault[];
    const oldVaultSigners = oldRealm.objects(RealmSchema.VaultSigner) as any;
    const newVaultSigners = oldRealm.objects(RealmSchema.VaultSigner) as any;
    for (const objectIndex in oldVaults) {
      if (
        oldVaults[objectIndex] &&
        oldVaults[objectIndex].signers &&
        oldVaults[objectIndex].signers.length
      ) {
        oldVaults[objectIndex].signers.forEach((signer) => {
          newVaults[objectIndex].signers.forEach((newSigner) => {
            newSigner.masterFingerprint = signer.masterFingerprint;
            newSigner.xpub = signer.xpub;
            newSigner.xpriv = signer.xpriv ? signer.xpriv : undefined;
            newSigner.derivationPath = signer.derivationPath;
            newSigner.xfp = signer.signerId;
            newSigner.vaultInfo = {
              [oldVaults[objectIndex].id]: {
                registered: signer.registered,
                registrationInfo: signer.deviceInfo ? JSON.stringify(signer.deviceInfo) : undefined,
              },
            };
          });
        });
      }
    }
    oldVaultSigners.forEach((signer, index) => {
      newVaultSigners[index].masterFingerprint = signer.masterFingerprint;
      newVaultSigners[index].type = signer.type;
      newVaultSigners[index].signerXpubs = {
        [signer.derivationPath]: {
          xpub: signer.xpub,
          xpriv: signer.xpriv,
          type: WalletUtilities.getScriptTypeFromDerivationPath(signer.derivationPath),
        },
      };
      newVaultSigners[index].signerName = signer.signerName;
      newVaultSigners[index].signerDescription = signer.signerDescription;
      newVaultSigners[index].lastHealthCheck = signer.lastHealthCheck;
      newVaultSigners[index].addedOn = signer.addedOn;
      newVaultSigners[index].isMock = signer.isMock;
      newVaultSigners[index].storageType = signer.storageType;
      newVaultSigners[index].bip85Config = signer.bip85Config;
      newVaultSigners[index].signerPolicy = signer.signerPolicy;
      newVaultSigners[index].inheritanceKeyInfo = signer.inheritanceKeyInfo;
      newVaultSigners[index].hidden = false;
    });
  }
};
