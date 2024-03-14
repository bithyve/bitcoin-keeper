/* eslint-disable no-await-in-loop */
import { SignerType, XpubTypes } from 'src/services/wallets/enums';
import { Signer, Vault, VaultSigner, XpubDetailsType } from 'src/services/wallets/interfaces/vault';
import { HWErrorType } from 'src/models/enums/Hardware';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/services/utilities/config';
import * as bitcoinJS from 'bitcoinjs-lib';
import { SigningPayload } from 'src/services/wallets/interfaces';
import { captureError } from 'src/services/sentry';
import reverse from 'buffer-reverse';
import ElectrumClient from 'src/services/electrum/client';
import { BtcToSats } from 'src/constants/Bitcoin';
import HWError from '../HWErrorState';
import { getKeypathFromString } from '..';

export const getBitbox02Details = (data, isMultisig) => {
  try {
    const { multiSigPath, multiSigXpub, singleSigPath, singleSigXpub } = data;
    const xpubDetails: XpubDetailsType = {};
    xpubDetails[XpubTypes.P2WPKH] = { xpub: singleSigXpub, derivationPath: singleSigPath };
    xpubDetails[XpubTypes.P2WSH] = { xpub: multiSigXpub, derivationPath: multiSigPath };
    const xpub = isMultisig ? multiSigXpub : singleSigXpub;
    const derivationPath = isMultisig ? multiSigPath : singleSigPath;
    const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
    return {
      xpub,
      derivationPath,
      masterFingerprint: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      xpubDetails,
    };
  } catch (_) {
    throw new HWError(HWErrorType.INCORRECT_HW);
  }
};

export const getWalletConfigForBitBox02 = ({ vault, signer }: { vault: Vault; signer: Signer }) => {
  const ourXPubIndex = vault.signers.findIndex(
    (vaultKey) =>
      signer.type === SignerType.BITBOX02 && signer.masterFingerprint === vaultKey.masterFingerprint
  );
  const keypathAccountDerivation = vault.signers.find(
    (vaultKey) =>
      signer.type === SignerType.BITBOX02 && signer.masterFingerprint === vaultKey.masterFingerprint
  ).derivationPath;
  return {
    ourXPubIndex,
    keypathAccountDerivation,
    threshold: vault.scheme.m,
    xpubs: vault.signers.map((signer) => signer.xpub),
  };
};

export const getTxForBitBox02 = async (
  serializedPSBT: string,
  signingPayload: SigningPayload[],
  vaultKey: VaultSigner,
  isMultisig: boolean,
  vault: Vault,
  signer: Signer
) => {
  try {
    const payload = signingPayload[0];
    const psbt = bitcoinJS.Psbt.fromBase64(serializedPSBT, { network: config.NETWORK });
    const { change: changeAddress } = payload;
    const keypathAccount = getKeypathFromString(vaultKey.derivationPath);
    const inputs = [];
    let index = 0;
    const { version, locktime } = psbt;
    const inputUtxos = psbt.data.inputs;
    for (const input of psbt.txInputs) {
      const subPath = psbt.data.inputs[index].bip32Derivation[0].path.split('/');
      const c = subPath[subPath.length - 2];
      const a = subPath[subPath.length - 1];
      const reversedHash = reverse(input.hash);
      const txid = reversedHash.toString('hex');
      const prevTxs = await ElectrumClient.getTransactionsById([txid]);
      const tx = prevTxs[txid];
      const { version, locktime, vin, vout } = tx;
      inputs.push({
        prevOutHash: input.hash.toString('hex'),
        prevOutIndex: input.index,
        prevOutValue: inputUtxos[index].witnessUtxo.value.toString(),
        sequence: input.sequence,
        keypath: keypathAccount.concat([Number(c), Number(a)]),
        prevTx: {
          version,
          locktime,
          inputs: vin.map((input) => ({
            prevOutHash: reverse(Buffer.from(input.txid, 'hex')).toString('hex'),
            prevOutIndex: input.vout,
            signatureScript: input.scriptSig.hex,
            sequence: input.sequence,
          })),
          outputs: vout.map((output) => ({
            value: BtcToSats(output.value).toString(),
            pubkeyScript: output.scriptPubKey.hex,
          })),
        },
      });
      index += 1;
    }
    const outputs = psbt.txOutputs.map((output) => {
      const isChangeOutput = output.address === changeAddress;
      return isChangeOutput
        ? {
            ours: true,
            value: output.value.toString(),
            keypath: keypathAccount.concat([1, vault.specs.nextFreeChangeAddressIndex]),
          }
        : {
            ours: false,
            value: output.value.toString(),
            payload: WalletUtilities.getPubkeyHashFromScript(
              output.address,
              output.script
            ).toString('hex'),
          };
    });
    const walletConfig = isMultisig ? getWalletConfigForBitBox02({ vault, signer }) : null;
    return {
      inputs,
      outputs,
      isMultisig,
      walletConfig,
      version,
      locktime,
      derivationPath: vaultKey.derivationPath,
    };
  } catch (error) {
    captureError(error);
  }
};

export const getSignedSerializedPSBTForBitbox02 = (unsignedPSBT, signatures, signingPayload) => {
  try {
    const PSBT = bitcoinJS.Psbt.fromBase64(unsignedPSBT, { network: config.NETWORK });
    const { inputsToSign } = signingPayload[0];
    for (let inputIndex = 0; inputIndex < inputsToSign.length; inputIndex += 1) {
      const { sighashType, publicKey } = inputsToSign[inputIndex];
      PSBT.addSignedDigest(
        inputIndex,
        Buffer.from(publicKey, 'hex'),
        Buffer.from(signatures[inputIndex], 'hex'),
        sighashType
      );
    }
    const signedSerializedPSBT = PSBT.toBase64();
    return { signedSerializedPSBT };
  } catch (err) {
    captureError(err);
  }
};
