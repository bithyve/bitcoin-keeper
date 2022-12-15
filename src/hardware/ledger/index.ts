import { EntityKind, NetworkType, SignerStorage, SignerType } from 'src/core/wallets/enums';
import config from 'src/core/config';

import BluetoothTransport from '@ledgerhq/react-native-hw-transport-ble';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import { PsbtV2 } from './client/psbtv2';
import AppClient from './client/appClient';
import { DefaultWalletPolicy, WalletPolicy } from './client/policy';
import { generateSignerFromMetaData } from '..';

export const getLedgerDetails = async (transport: BluetoothTransport) => {
  const app = new AppClient(transport);
  const networkType = config.NETWORK_TYPE;
  // m / purpose' / coin_type' / account' / script_type' / change / address_index bip-48
  const derivationPath = networkType === NetworkType.TESTNET ? "m/48'/1'/0'/1'" : "m/48'/0'/0'/1'";
  const xpub = await app.getExtendedPubkey(derivationPath);
  const masterfp = await app.getMasterFingerprint();
  return { xpub, derivationPath, xfp: masterfp };
};

export const getMockLedgerDetails = (amfData = null) => {
  const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKeyForSigner(
    EntityKind.VAULT,
    SignerType.LEDGER,
    config.NETWORK_TYPE
  );

  const ledger: VaultSigner = generateSignerFromMetaData({
    xpub,
    xpriv,
    derivationPath,
    xfp: masterFingerprint,
    signerType: SignerType.LEDGER,
    storageType: SignerStorage.COLD,
    isMock: true,
  });

  if (amfData) {
    ledger.amfData = amfData;
    ledger.signerName = 'Nano X*';
    ledger.isMock = false;
  }
  return ledger;
};

export { AppClient, PsbtV2, DefaultWalletPolicy, WalletPolicy };
export default AppClient;
