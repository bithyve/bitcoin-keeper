import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { SignerType } from 'src/services/wallets/enums';
import { InheritanceKeyInfo } from 'src/models/interfaces/AssistedKeys';
import { UAI } from 'src/models/interfaces/Uai';
import { getSignerNameFromType } from 'src/hardware';
import _ from 'lodash';
import { getJSONFromRealmObject } from './utils';
import { RealmSchema } from './enum';

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
            signerName: getSignerNameFromType(signer.type),
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
  } // end of IKS migration

  // uai migrations
  if (oldRealm.schemaVersion < 67) {
    const oldUAIs = oldRealm.objects(RealmSchema.UAI) as any;
    const newUAIs = newRealm.objects(RealmSchema.UAI) as UAI[];
    for (const objectIndex in newUAIs) {
      newUAIs[objectIndex].uaiDetails = { heading: oldUAIs[objectIndex].title };
    }
  }

  if (oldRealm.schemaVersion < 70 && oldRealm.schemaVersion >= 66) {
    const vaultXpubMap = {};
    const newVaults: Vault[] = newRealm.objects(RealmSchema.Vault);

    newVaults.forEach((vault) => {
      const { signers } = vault;
      vaultXpubMap[vault.id] = signers.map((signer) => signer.xpub);
    });

    const newVaultSigners: VaultSigner[] = newRealm.objects(RealmSchema.VaultSigner);
    const signerXpubMap = {};
    const duplicateSigners = [];

    for (const signer of newVaultSigners) {
      const { xpub } = signer;
      if (signerXpubMap[xpub]) {
        duplicateSigners.push(signer);
      }
      signerXpubMap[xpub] = _.merge({}, signerXpubMap[xpub] || {}, signer.toJSON());
    }

    const singleCopyOfDuplicateSigners = duplicateSigners.reduce((acc, signer) => {
      const { xpub } = signer;
      if (acc[xpub]) {
        return acc;
      }
      acc[xpub] = signerXpubMap[xpub];
      return acc;
    }, {});

    if (duplicateSigners.length) {
      newRealm.delete(duplicateSigners);
    }
    Object.values(singleCopyOfDuplicateSigners).forEach((signer) => {
      newRealm.create(RealmSchema.VaultSigner, signer, Realm.UpdateMode.All);
    });

    newVaults.forEach((vault) => {
      vault.signers = vaultXpubMap[vault.id].map((xpub) => {
        return newRealm.objects(RealmSchema.VaultSigner).filtered(`xpub == '${xpub}'`)[0];
      });
    });
  }

  if (oldRealm.schemaVersion < 78) {
    const oldNodeConnects = oldRealm.objects(RealmSchema.NodeConnect);
    const newNodeConnects = newRealm.objects(RealmSchema.NodeConnect);
    const oldDefaultNodeConnects = oldRealm.objects(RealmSchema.DefaultNodeConnect);
    const newDefaultNodeConnects = newRealm.objects(RealmSchema.DefaultNodeConnect);

    for (let i = 0; i < oldNodeConnects.length; i++) {
      const oldNodeConnect = oldNodeConnects[i];
      const newNodeConnect = newNodeConnects[i];

      // Remove the 'isDefault' property
      if ('isDefault' in oldNodeConnect) {
        if ('isDefault' in newNodeConnect) {
          delete (newNodeConnect as any).isDefault;
        }
      }
    }

    for (let i = 0; i < oldDefaultNodeConnects.length; i++) {
      const oldDefaultNodeConnect = oldDefaultNodeConnects[i];
      const newDefaultNodeConnect = newDefaultNodeConnects[i];

      // Remove the 'isDefault' property
      if ('isDefault' in oldDefaultNodeConnect) {
        if ('isDefault' in newDefaultNodeConnect) {
          delete (newDefaultNodeConnect as any).isDefault;
        }
      }
    }
  }

  if (oldRealm.schemaVersion < 79) {
    const vaults = newRealm.objects(RealmSchema.Vault) as any;
    const wallets = newRealm.objects(RealmSchema.Wallet) as any;

    [...vaults, ...wallets].forEach((wallet) => {
      console.log(wallet.specs);
      if (wallet.specs) {
        wallet.specs.totalExternalAddresses = wallet.specs.nextFreeAddressIndex + 1;
      }
    });
  }

  if (oldRealm.schemaVersion < 80) {
    const oldVaults = oldRealm.objects(RealmSchema.Vault) as any;
    const newVaults = newRealm.objects(RealmSchema.Vault) as any;

    for (let i = 0; i < oldVaults.length; i++) {
      const oldVault = oldVaults[i];
      const newVault = newVaults[i];

      newVault.scheme = {
        // Preserve existing m and n values
        m: oldVault.scheme.m,
        n: oldVault.scheme.n,

        // Add new fields with default or null values
        multisigScriptType: null,
        miniscriptScheme: null,
      };
    }
  }
};
