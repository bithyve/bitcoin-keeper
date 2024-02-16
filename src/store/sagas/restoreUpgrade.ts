import { call } from 'redux-saga/effects';
import semver from 'semver';
import { decrypt, encrypt } from 'src/services/operations/encryption';
import Relay from 'src/services/operations/Relay';
import { Vault } from 'src/core/wallets/interfaces/vault';

export function* applyRestoreSequence({
  previousVersion,
  newVersion,
  appImage,
  vaultImage,
  encryptionKey,
}: {
  previousVersion: string;
  newVersion: string;
  appImage: any;
  vaultImage: any;
  encryptionKey: string;
}) {
  console.log(`applying restore upgarde sequence - from: ${previousVersion} to ${newVersion}`);

  yield call(updateVersion, appImage, newVersion);
}

function* additionOfVaultShellId(vaultImage, appImage, encryptionKey) {
  try {
    //updating Vault Image on Relay first then changing it in local image
    const vault: Vault = JSON.parse(decrypt(encryptionKey, vaultImage.vault));
    vault.shellId = appImage.appId;
    const vaultEncrypted = encrypt(encryptionKey, JSON.stringify(vault));
    const response = yield call(Relay.updateVaultImage, {
      vaultShellId: vault.shellId,
      vaultId: vault.id,
      vault: vaultEncrypted,
    });
    if (response.updated) {
      vaultImage.shellId = appImage.appId;
      return;
    }
  } catch (err) {
    console.log(err);
  }
}

//while restoring, updating the version on the appImage
//TODO
function* updateVersion(appImage, newVersion) {
  try {
    yield call(Relay.updateAppImage, {
      appId: appImage.appId,
      version: newVersion,
    });
  } catch (err) {
    console.log(err);
  }
}
