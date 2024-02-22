import { Signer, Vault } from 'src/core/wallets/interfaces/vault';
import { RealmSchema } from './enum';
import { getJSONFromRealmObject } from './utils';
import { SignerType } from 'src/core/wallets/enums';
import { InheritanceKeyInfo } from 'src/services/interfaces';

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

  // IKS migration: single to multiple config support
  if (oldRealm.schemaVersion < 61) {
    // 61 schema version corresponds to ASSISTED_KEYS_MIGRATION_VERSION for upgrade sequence(v2 to v3 migration)
    const oldVaults = oldRealm.objects(RealmSchema.Vault) as any;
    const activeVault: Vault = oldVaults.filter((vault) => !vault.archived)[0] || null;

    if (activeVault) {
      const { signers } = activeVault;
      const signerMap = {};
      oldRealm
        .objects(RealmSchema.Signer)
        .forEach((signer) => (signerMap[(signer as any).masterFingerprint] = signer));

      for (const signer of signers) {
        const signerType = signerMap[signer.masterFingerprint].type;
        if (signerType === SignerType.INHERITANCEKEY) {
          const IKSSigner: Signer = signerMap[signer.masterFingerprint];
          const previousConfig = (IKSSigner.inheritanceKeyInfo as any).configuration; // previous schema for IKS had single configuration

          previousConfig.id = activeVault.id;
          const updatedInheritanceKeyInfo: InheritanceKeyInfo = {
            configurations: [previousConfig],
            policy: IKSSigner.inheritanceKeyInfo.policy,
          };

          const updateProps = {
            inheritanceKeyInfo: updatedInheritanceKeyInfo,
          };

          const signerObjects = newRealm.objects(RealmSchema.Signer) as any;
          const IKSSignerObject = signerObjects.filtered(
            `${'masterFingerprint'} == '${IKSSigner.masterFingerprint}'`
          )[0];

          for (const [key, value] of Object.entries(updateProps)) {
            // realm is already in write mode(hence we don't have to wrap this statement in realm.write())
            IKSSignerObject[key] = value;
          }
        }
      }
    }
  }
};
