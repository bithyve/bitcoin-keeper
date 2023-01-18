import { EntityKind, NetworkType, SignerStorage, SignerType } from 'src/core/wallets/enums';
import config from 'src/core/config';
import BluetoothTransport from '@ledgerhq/react-native-hw-transport-ble';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import * as bitcoinJS from 'bitcoinjs-lib';
import { SigningPayload } from 'src/core/wallets/interfaces';
import { PsbtV2 } from './client/psbtv2';
import AppClient from './client/appClient';
import { DefaultWalletPolicy, WalletPolicy } from './client/policy';
import { generateSignerFromMetaData } from '..';

const bscript = require('bitcoinjs-lib/src/script');

export const getLedgerDetails = async (transport: BluetoothTransport, isMultisig) => {
  const app = new AppClient(transport);
  const networkType = config.NETWORK_TYPE;
  // m / purpose' / coin_type' / account' / script_type' / change / address_index bip-48
  const coinType = networkType === NetworkType.TESTNET ? 1 : 0;
  const derivationPath = isMultisig ? `m/48'/${coinType}'/0'/1'` : `m/84'/${coinType}'/0'`;
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

const getPSBTv2Fromv0 = (psbtv0: bitcoinJS.Psbt) => {
  const { inputCount, outputCount } = psbtv0.data.globalMap.unsignedTx.getInputOutputCounts();
  const psbtv2 = new PsbtV2();
  psbtv2.setGlobalInputCount(inputCount);
  psbtv2.setGlobalOutputCount(outputCount);
  psbtv2.deserialize(psbtv0.toBuffer());
  psbtv2.setGlobalPsbtVersion(2);
  psbtv2.setGlobalTxVersion(psbtv0.version);
  psbtv0.txInputs.forEach((input, index) => {
    psbtv2.setInputPreviousTxId(index, input.hash);
    psbtv2.setInputSequence(index, input.sequence);
    psbtv2.setInputOutputIndex(index, input.index);
  });
  psbtv0.txOutputs.forEach((output, i) => {
    psbtv2.setOutputAmount(i, output.value);
    psbtv2.setOutputScript(i, output.script);
  });
  return psbtv2;
};

export const regsiterWithLedger = async (vault: Vault, transport) => {
  const app = new AppClient(transport);
  const walletPolicy = await getWalletPolicy(vault);
  const [policyId, policyHmac] = await app.registerWallet(walletPolicy);
  return { policyId, policyHmac };
};

const getWalletPolicy = async (vault: Vault) => {
  const { signers, isMultiSig, scheme } = vault;
  const path = `${signers[0].xpubInfo.xfp}${signers[0].xpubInfo.derivationPath.slice(
    signers[0].xpubInfo.derivationPath.indexOf('/')
  )}`;
  const walletPolicy = !isMultiSig
    ? new DefaultWalletPolicy('wpkh(@0/**)', `[${path}]${signers[0].xpub}`)
    : new WalletPolicy(
        'Keeper Vault',
        `wsh(sortedmulti(${scheme.m},${signers.map((_, index) => `@${index}/**`).join(',')}))`,
        signers.map((signer) => {
          const path = `${signer.xpubInfo.xfp.toLowerCase()}${signer.xpubInfo.derivationPath.slice(
            signer.xpubInfo.derivationPath.indexOf('/')
          )}`;
          return `[${path}]${signer.xpub}`;
        })
      );
  return walletPolicy;
};

export const signWithLedger = async (
  transport,
  serializedPSBT,
  signingPayload: SigningPayload[],
  vault: Vault
) => {
  const app = new AppClient(transport);
  const psbtv0 = bitcoinJS.Psbt.fromBase64(serializedPSBT);
  const walletPolicy = await getWalletPolicy(vault);
  const psbtv2 = getPSBTv2Fromv0(psbtv0);
  const result = await app.signPsbt(psbtv2, walletPolicy, null);
  const signedData = result.map((input) => ({
    inputIndex: input[0], // the index of the input being signed.
    pubkeySecret: input[1], // a Buffer with either a 33-byte compressed pubkey or a 32-byte x-only pubkey whose corresponding secret key was used to sign.
    signature: input[2], // a Buffer with the corresponding signature.
  }));

  // construct signed PSBT from the corresponding signatures of the inputs
  const { inputsToSign } = signingPayload[0];
  for (let inputIndex = 0; inputIndex < inputsToSign.length; inputIndex += 1) {
    const { sighashType, publicKey } = inputsToSign[inputIndex];
    const { signature: derSignature } = signedData[inputIndex];
    const { signature } = bscript.signature.decode(derSignature); // re-encode from der to 64 byte
    psbtv0.addSignedDisgest(
      signedData[inputIndex].inputIndex,
      Buffer.from(publicKey, 'hex'),
      signature,
      sighashType
    );
  }

  return { signedSerializedPSBT: psbtv0.toBase64() };
};

export { AppClient, PsbtV2, DefaultWalletPolicy, WalletPolicy };
export default AppClient;
