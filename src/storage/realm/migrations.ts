import { Signer } from 'src/core/wallets/interfaces/vault';
import { RealmSchema } from './enum';
import { getJSONFromRealmObject } from './utils';
import { UAI } from 'src/models/interfaces/Uai';

export const runRealmMigrations = ({
  oldRealm,
  newRealm,
}: {
  oldRealm: Realm;
  newRealm: Realm;
}) => {
  // vault migrations for seggregated key management
  if (oldRealm.schemaVersion < 63) {
    const oldVaults = oldRealm.objects(RealmSchema.Vault) as any;
    const newVaults = newRealm.objects(RealmSchema.Vault);
    for (const objectIndex in oldVaults) {
      if (oldVaults[objectIndex]?.signers?.length) {
        const newVaultKeys = newVaults[objectIndex].signers;
        oldVaults[objectIndex].signers.forEach((signer, index) => {
          newVaultKeys[index].xfp = signer.signerId;
          newVaultKeys[index].registeredVaults.push({
            vaultId: oldVaults[objectIndex].id,
            registered: signer.registered,
            registrationInfo: signer.deviceInfo ? JSON.stringify(signer.deviceInfo) : '',
          });
        });
      }
    }
    oldVaults.forEach((vault) => {
      if (vault.signers.length) {
        vault.signers.forEach((signer) => {
          signer = getJSONFromRealmObject(signer);
          const signerXpubs = {};
          Object.keys(signer.xpubDetails).forEach((type) => {
            if (signer.xpubDetails[type].xpub) {
              if (signerXpubs[type]) {
                signerXpubs[type].push({
                  xpub: signer.xpubDetails[type].xpub,
                  xpriv: signer.xpubDetails[type].xpriv,
                  derivationPath: signer.xpubDetails[type].derivationPath,
                });
              } else {
                signerXpubs[type] = [
                  {
                    xpub: signer.xpubDetails[type].xpub,
                    xpriv: signer.xpubDetails[type].xpriv,
                    derivationPath: signer.xpubDetails[type].derivationPath,
                  },
                ];
              }
            }
          });
          const signerObject: Signer = {
            masterFingerprint: signer.masterFingerprint,
            type: signer.type,
            signerName: signer.signerName,
            signerDescription: signer.signerDescription,
            lastHealthCheck: signer.lastHealthCheck,
            addedOn: signer.addedOn,
            isMock: signer.isMock,
            storageType: signer.storageType,
            signerPolicy: signer.signerPolicy,
            inheritanceKeyInfo: signer.inheritanceKeyInfo,
            hidden: false,
            signerXpubs,
          };
          newRealm.create(RealmSchema.Signer, signerObject, Realm.UpdateMode.All);
        });
      }
    });
  }

  //uai migrations
  if (oldRealm.schemaVersion < 67) {
    const oldUAIs = oldRealm.objects(RealmSchema.UAI) as any;
    const newUAIs = newRealm.objects(RealmSchema.UAI) as UAI[];
    for (const objectIndex in newUAIs) {
      newUAIs[objectIndex].uaiDetails.heading = oldUAIs[objectIndex].title;
    }
  }
};
