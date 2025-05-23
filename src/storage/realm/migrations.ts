import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { MiniscriptTypes, NetworkType, VaultType } from 'src/services/wallets/enums';
import { UAI } from 'src/models/interfaces/Uai';
import { getSignerNameFromType } from 'src/hardware';
import _ from 'lodash';
import { getJSONFromRealmObject } from './utils';
import { RealmSchema } from './enum';
import { getKeyUID } from 'src/utils/utilities';
import config, { APP_STAGE } from 'src/utils/service-utilities/config';

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
          if (!newVaultKeys[index].registeredVaults) {
            newVaultKeys[index].registeredVaults = [];
          }
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
            hidden: false,
            signerXpubs,
          };
          newRealm.create(RealmSchema.Signer, signerObject, Realm.UpdateMode.All);
        });
      }
    });
  }

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
    try {
      const oldNodeConnects = oldRealm.objects(RealmSchema.NodeConnect);
      const newNodeConnects = newRealm.objects(RealmSchema.NodeConnect);

      // Check if DefaultNodeConnect schema exists before trying to access it
      const hasDefaultNodeConnectSchema = oldRealm.schema.some(
        (schema) => schema.name === RealmSchema.DefaultNodeConnect
      );

      for (let i = 0; i < oldNodeConnects.length; i++) {
        try {
          const oldNodeConnect = oldNodeConnects[i];
          const newNodeConnect = newNodeConnects[i];

          if ('isDefault' in oldNodeConnect && 'isDefault' in newNodeConnect) {
            delete (newNodeConnect as any).isDefault;
          }
        } catch (innerError) {
          console.warn('Error processing individual NodeConnect:', innerError);
          // Continue with next item even if one fails
        }
      }

      // Only process DefaultNodeConnect if the schema exists
      if (hasDefaultNodeConnectSchema) {
        const oldDefaultNodeConnects = oldRealm.objects(RealmSchema.DefaultNodeConnect);
        const newDefaultNodeConnects = newRealm.objects(RealmSchema.DefaultNodeConnect);

        for (let i = 0; i < oldDefaultNodeConnects.length; i++) {
          try {
            const oldDefaultNodeConnect = oldDefaultNodeConnects[i];
            const newDefaultNodeConnect = newDefaultNodeConnects[i];

            if ('isDefault' in oldDefaultNodeConnect && 'isDefault' in newDefaultNodeConnect) {
              delete (newDefaultNodeConnect as any).isDefault;
            }
          } catch (innerError) {
            console.warn('Error processing individual DefaultNodeConnect:', innerError);
            // Continue with next item even if one fails
          }
        }
      }
    } catch (error) {
      console.error('Error during schema migration 78:', error);
      // Migration should continue even if this part fails
    }
  }

  if (oldRealm.schemaVersion < 79) {
    const vaults = newRealm.objects(RealmSchema.Vault) as any;
    const wallets = newRealm.objects(RealmSchema.Wallet) as any;

    [...vaults, ...wallets].forEach((wallet) => {
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

  // Add migration for Signer primary key change
  if (oldRealm.schemaVersion < 81) {
    const oldSigners = oldRealm.objects(RealmSchema.Signer) as any;
    const newSigners = newRealm.objects(RealmSchema.Signer) as Signer[];

    for (const objectIndex in newSigners) {
      newSigners[objectIndex].id = getKeyUID(oldSigners[objectIndex]);
    }
  }

  if (oldRealm.schemaVersion < 84) {
    const oldVaults = oldRealm.objects(RealmSchema.Vault) as any;
    const newVaults = newRealm.objects(RealmSchema.Vault) as any;

    for (let i = 0; i < oldVaults.length; i++) {
      const oldVault = oldVaults[i];
      const newVault = newVaults[i];

      if (
        oldVault.type === VaultType.TIMELOCKED ||
        oldVault.type === VaultType.ASSISTED ||
        oldVault.type === VaultType.INHERITANCE
      ) {
        const oldVaultPlain = getJSONFromRealmObject(oldVault);
        newVault.scheme.miniscriptScheme.usedMiniscriptTypes = [
          oldVaultPlain.type === VaultType.TIMELOCKED
            ? MiniscriptTypes.TIMELOCKED
            : oldVaultPlain.type === VaultType.ASSISTED
            ? MiniscriptTypes.ASSISTED
            : oldVaultPlain.type === VaultType.INHERITANCE
            ? MiniscriptTypes.INHERITANCE
            : false,
        ].filter(Boolean);
        newVault.type = VaultType.MINISCRIPT;
      } else {
        if (oldVault?.scheme?.miniscriptScheme?.miniscript) {
          newVault.scheme.miniscriptScheme.usedMiniscriptTypes = [MiniscriptTypes.INHERITANCE];
          newVault.type = VaultType.MINISCRIPT;
        }
      }
    }
  }

  if (oldRealm.schemaVersion < 86) {
    try {
      const newSigners = newRealm.objects(RealmSchema.Signer) as Signer[];
      const newVaults = newRealm.objects(RealmSchema.Vault) as Vault[];

      // First pass: Create a map of uppercase IDs to their signers
      const upperCaseSignerMap = {};
      for (const signer of newSigners) {
        const upperCaseId = signer.id?.toUpperCase();
        const upperCaseMfp = signer.masterFingerprint?.toUpperCase();

        if (upperCaseId) {
          if (!upperCaseSignerMap[upperCaseId]) {
            upperCaseSignerMap[upperCaseId] = signer;
          } else {
            // Merge properties from duplicate signer into existing one
            const existingSigner = upperCaseSignerMap[upperCaseId];
            const signerJSON = signer.toJSON();

            // Update properties individually, merging where needed
            Object.keys(signerJSON).forEach((key) => {
              if (key === 'signerXpubs') {
                // Merge xpubs for each type
                Object.keys(signerJSON[key] || {}).forEach((xpubType) => {
                  if (!existingSigner[key][xpubType]) {
                    existingSigner[key][xpubType] = signerJSON[key][xpubType];
                  } else {
                    // Deduplicate xpubs based on xpub+derivationPath combination
                    const uniqueXpubs = new Map();
                    [...existingSigner[key][xpubType], ...signerJSON[key][xpubType]].forEach(
                      (xpubEntry) => {
                        const key = `${xpubEntry.xpub}_${xpubEntry.derivationPath}`;
                        uniqueXpubs.set(key, xpubEntry);
                      }
                    );
                    existingSigner[key][xpubType] = Array.from(uniqueXpubs.values());
                  }
                });
              } else if (key === 'healthCheckDetails') {
                // Ensure healthCheckDetails is always an array
                const existingDetails = Array.isArray(existingSigner[key])
                  ? existingSigner[key]
                  : [];
                const newDetails = Array.isArray(signerJSON[key]) ? signerJSON[key] : [];
                existingSigner[key] = [...existingDetails, ...newDetails];
              } else if (key === 'lastHealthCheck' || key === 'addedOn') {
                // Handle date fields
                const dateValue = signerJSON[key] ? new Date(signerJSON[key]) : null;
                existingSigner[key] = existingSigner[key] ?? dateValue;
              } else if (Array.isArray(existingSigner[key])) {
                // Merge arrays
                existingSigner[key] = [...existingSigner[key], ...signerJSON[key]];
              } else if (typeof signerJSON[key] === 'object' && signerJSON[key] !== null) {
                // Merge nested objects
                existingSigner[key] = { ...existingSigner[key], ...signerJSON[key] };
              } else {
                // For primitive values, keep existing value if present
                existingSigner[key] = existingSigner[key] ?? signerJSON[key];
              }
            });

            // Ensure ID and masterFingerprint are uppercase
            existingSigner.id = upperCaseId;
            existingSigner.masterFingerprint = upperCaseMfp;

            newRealm.delete(signer);
          }
        }
      }

      // Second pass: Update remaining signers to uppercase
      for (const signer of newSigners) {
        if (signer.isValid()) {
          signer.id = signer.id?.toUpperCase();
          signer.masterFingerprint = signer.masterFingerprint?.toUpperCase();
        }
      }

      // Update vault signers
      for (const vault of newVaults) {
        vault.signers.forEach((signer) => {
          if (signer.masterFingerprint) {
            signer.masterFingerprint = signer.masterFingerprint.toUpperCase();
          }
        });
      }

      // Node cleanup
      const nodeConnects = newRealm.objects(RealmSchema.NodeConnect);
      if (nodeConnects.length > 1) {
        const blockstreamNodes = nodeConnects.filtered('host CONTAINS "blockstream"');
        if (blockstreamNodes.length > 0) {
          // If blockstream node was connected, make the first remaining node connected
          const wasConnected = blockstreamNodes[0].isConnected;
          if (wasConnected) {
            const remainingNodes = nodeConnects.filtered('NOT(host CONTAINS "blockstream")');
            if (remainingNodes.length > 0) {
              remainingNodes[0].isConnected = true;
            }
          }

          newRealm.delete(blockstreamNodes);
        }
      }
    } catch (error) {
      console.error('Error during schema migration 86:', error);
      // Migration should continue even if this part fails
    }
  }

  // Add missing isDesktopPurchase field
  if (oldRealm.schemaVersion < 89) {
    const newSubs = newRealm.objects(RealmSchema.StoreSubscription) as any;
    newSubs['isDesktopPurchase'] = false;
  }

  if (oldRealm.schemaVersion < 93) {
    const newVaults = newRealm.objects(RealmSchema.Vault) as any;
    const newWallets = newRealm.objects(RealmSchema.Wallet) as any;

    for (const vault of newVaults) delete vault.specs.txNote;

    for (const wallet of newWallets) delete wallet.specs.txNote;
  }
  if (oldRealm.schemaVersion < 94) {
    const newSigners = newRealm.objects(RealmSchema.Signer) as Signer[];

    for (const objectIndex in newSigners) {
      newSigners[objectIndex].networkType =
        config.ENVIRONMENT == APP_STAGE.PRODUCTION ? NetworkType.MAINNET : NetworkType.TESTNET;
      newSigners[objectIndex].id = getKeyUID(newSigners[objectIndex]);
    }
  }

  if (oldRealm.schemaVersion < 95) {
    const oldUAIs = oldRealm.objects(RealmSchema.UAI) as any;
    const newUAIs = newRealm.objects(RealmSchema.UAI) as UAI[];

    for (const objectIndex in newUAIs) {
      newUAIs[objectIndex].uaiDetails = {
        ...oldUAIs[objectIndex].uaiDetails,
        networkType:
          config.ENVIRONMENT == APP_STAGE.PRODUCTION ? NetworkType.MAINNET : NetworkType.TESTNET,
      };
    }

    const newNodes = newRealm.objects(RealmSchema.NodeConnect) as any;

    for (const objectIndex in newNodes) {
      newNodes[objectIndex].networkType =
        config.ENVIRONMENT == APP_STAGE.PRODUCTION ? NetworkType.MAINNET : NetworkType.TESTNET;
    }
  }

  if (oldRealm.schemaVersion < 99) {
    // Realm v12 changed the schema type for certain fields, need to manually migrate the values to the new type
    const newVaults = newRealm.objects(RealmSchema.Vault) as any;
    const oldVaults = oldRealm.objects(RealmSchema.Vault) as any;
    const newWallets = newRealm.objects(RealmSchema.Wallet) as any;
    const oldWallets = oldRealm.objects(RealmSchema.Wallet) as any;

    // Migrating wallets fields for new schema
    newWallets.forEach((newWallet, i) => {
      const oldWallet = oldWallets[i];
      const { specs: oldSpecs } = oldWallet;
      const { specs: newSpecs } = newWallet;
      newSpecs.addresses = oldSpecs?.addresses ? { ...oldSpecs.addresses } : null;
      newSpecs.addressPubs = oldSpecs?.addressPubs ? { ...oldSpecs?.addressPubs } : null;
      newSpecs.balances = {
        confirmed: oldSpecs.balances?.confirmed ?? 0,
        unconfirmed: oldSpecs.balances?.unconfirmed ?? 0,
      };
    });

    // migrating Vault fields for new schema
    newVaults.forEach((newVault, i) => {
      const oldVault = oldVaults[i];
      const { specs: oldSpecs } = oldVault;
      const { specs: newSpecs } = newVault;
      newSpecs.addresses = { ...oldSpecs?.addresses };
      newSpecs.addressPubs = { ...oldSpecs?.addressPubs };
      newSpecs.balances = {
        confirmed: oldSpecs.balances?.confirmed ?? 0,
        unconfirmed: oldSpecs.balances?.unconfirmed ?? 0,
      };

      if (newVault.type === VaultType.MINISCRIPT) {
        const { miniscriptScheme: oldMiniscriptScheme } = oldVault.scheme;
        const { miniscriptScheme: newMiniscriptScheme } = newVault.scheme;
        newMiniscriptScheme.keyInfoMap = oldMiniscriptScheme?.keyInfoMap
          ? { ...oldMiniscriptScheme?.keyInfoMap }
          : null;
        newMiniscriptScheme.miniscriptElements = {
          ...oldMiniscriptScheme.miniscriptElements,
          signerFingerprints: oldMiniscriptScheme.miniscriptElements.signerFingerprints,
        };
      }
    });

    // Subscription receipt
    const oldSubs = oldRealm.objects(RealmSchema.StoreSubscription) as any;
    const newSubs = newRealm.objects(RealmSchema.StoreSubscription) as any;
    const lastSub = oldSubs.length - 1;
    if (oldSubs[lastSub] && oldSubs[lastSub].receipt.length) {
      newSubs[lastSub].receipt = oldSubs[lastSub].receipt;
    }

    // Signers extra data
    const oldSigners = oldRealm.objects(RealmSchema.Signer) as any;
    const newSigners = newRealm.objects(RealmSchema.Signer);
    for (const objectIndex in oldSigners) {
      if (newSigners[objectIndex].signerPolicy)
        newSigners[objectIndex].signerPolicy = { ...oldSigners[objectIndex].signerPolicy };
      newSigners[objectIndex].extraData = { ...oldSigners[objectIndex].extraData };
      if (oldSigners[objectIndex].healthCheckDetails.extraData) {
        newSigners[objectIndex].healthCheckDetails.extraData = {
          ...oldSigners[objectIndex].healthCheckDetails.extraData,
        };
      }
    }
  }
};
