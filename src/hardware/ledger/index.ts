import { ScriptTypes, XpubTypes } from 'src/core/wallets/enums';
import BluetoothTransport from '@ledgerhq/react-native-hw-transport-ble';
import { Vault, XpubDetailsType } from 'src/core/wallets/interfaces/vault';
import * as bitcoinJS from 'bitcoinjs-lib';
import { SigningPayload } from 'src/core/wallets/interfaces';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { PsbtV2 } from './client/psbtv2';
import AppClient from './client/appClient';
import { DefaultWalletPolicy, WalletPolicy } from './client/policy';

const bscript = require('bitcoinjs-lib/src/script');

export const getLedgerDetails = async (transport: BluetoothTransport, isMultisig: boolean) => {
  const app = new AppClient(transport);
  const xpubDetails: XpubDetailsType = {};
  // fetch P2WPKH details
  const singleSigPath = WalletUtilities.getDerivationForScriptType(ScriptTypes.P2WPKH);
  const singleSigXpub = await app.getExtendedPubkey(singleSigPath);
  xpubDetails[XpubTypes.P2WPKH] = { xpub: singleSigXpub, derivationPath: singleSigPath };
  // fetch P2WSH details
  const multiSigPath = WalletUtilities.getDerivationForScriptType(ScriptTypes.P2WSH);
  const multiSigXpub = await app.getExtendedPubkey(multiSigPath);
  xpubDetails[XpubTypes.P2WSH] = { xpub: multiSigXpub, derivationPath: multiSigPath };
  const xpub = isMultisig ? multiSigXpub : singleSigXpub;
  const derivationPath = isMultisig ? multiSigPath : singleSigPath;
  const masterfp = await app.getMasterFingerprint();
  return { xpub, derivationPath, xfp: masterfp, xpubDetails };
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
  psbtv0.txOutputs.forEach((output, index) => {
    psbtv2.setOutputAmount(index, output.value);
    psbtv2.setOutputScript(index, output.script);
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
  const path = `${signers[0].masterFingerprint}${signers[0].derivationPath.slice(
    signers[0].derivationPath.indexOf('/')
  )}`;
  const walletPolicy = !isMultiSig
    ? new DefaultWalletPolicy('wpkh(@0/**)', `[${path}]${signers[0].xpub}`)
    : new WalletPolicy(
        'Keeper Vault',
        `wsh(sortedmulti(${scheme.m},${signers.map((_, index) => `@${index}/**`).join(',')}))`,
        signers.map((signer) => {
          const path = `${signer.masterFingerprint.toLowerCase()}${signer.derivationPath.slice(
            signer.derivationPath.indexOf('/')
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
