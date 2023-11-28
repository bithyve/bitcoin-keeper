/* eslint-disable no-await-in-loop */
import { SignerType, XpubTypes } from 'src/core/wallets/enums';
import { Vault, VaultSigner, XpubDetailsType } from 'src/core/wallets/interfaces/vault';
import { HWErrorType } from 'src/models/enums/Hardware';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';
import * as bitcoinJS from 'bitcoinjs-lib';
import { SigningPayload } from 'src/core/wallets/interfaces';
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
      xfp: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      xpubDetails,
    };
  } catch (_) {
    throw new HWError(HWErrorType.INCORRECT_HW);
  }
};

export const getWalletConfigForBitBox02 = ({ vault }: { vault: Vault }) => {
  const ourXPubIndex = vault.signers.findIndex((signer) => signer.type === SignerType.BITBOX02);
  const keypathAccountDerivation = vault.signers.find(
    (signer) => signer.type === SignerType.BITBOX02
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
  signer: VaultSigner,
  isMultisig: boolean,
  vault: Vault
) => {
  try {
    const payload = signingPayload[0];
    const psbt = bitcoinJS.Psbt.fromBase64(serializedPSBT, { network: config.NETWORK });
    const {
      inputs: inputUtxos,
      outputs: outputUtxos,
      change: changeAddress,
      inputsToSign,
    } = payload;
    const keypathAccount = getKeypathFromString(signer.derivationPath);
    const inputs = [];
    let index = 0;
    const { version, locktime } = psbt;
    for (const input of psbt.txInputs) {
      const { subPath } = inputsToSign[index];
      const [, c, a] = subPath.split('/');
      const reversedHash = reverse(input.hash);
      const txid = reversedHash.toString('hex');
      const prevTxs = await ElectrumClient.getTransactionsById([txid]);
      const tx = prevTxs[txid];
      const { version, locktime, vin, vout } = tx;
      inputs.push({
        prevOutHash: input.hash,
        prevOutIndex: inputUtxos[index].vout,
        prevOutValue: inputUtxos[index].value.toString(),
        sequence: input.sequence,
        keypath: keypathAccount.concat([Number(c), Number(a)]),
        prevTx: {
          version,
          locktime,
          inputs: vin.map((input) => ({
            prevOutHash: reverse(Buffer.from(input.txid, 'hex')),
            prevOutIndex: input.vout,
            signatureScript: Buffer.from(input.scriptSig.hex, 'hex'),
            sequence: input.sequence,
          })),
          outputs: vout.map((output) => ({
            value: BtcToSats(output.value).toString(),
            pubkeyScript: Buffer.from(output.scriptPubKey.hex, 'hex'),
          })),
        },
      });
      index += 1;
    }
    const outputs = psbt.txOutputs.map((output, index) => {
      const isChangeOutput = output.address === changeAddress;
      return isChangeOutput
        ? {
            ours: true,
            value: outputUtxos[index].value.toString(),
            keypath: keypathAccount.concat([1, vault.specs.nextFreeChangeAddressIndex]),
          }
        : {
            ours: false,
            value: outputUtxos[index].value.toString(),
            payload: WalletUtilities.getPubkeyHashFromScript(output.address, output.script),
          };
    });
    const walletConfig = isMultisig ? getWalletConfigForBitBox02({ vault }) : null;
    return {
      inputs,
      outputs,
      isMultisig,
      walletConfig,
      version,
      locktime,
      derivationPath: signer.derivationPath,
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
        Buffer.from(signatures[inputIndex]),
        sighashType
      );
    }
    const signedSerializedPSBT = PSBT.toBase64();
    return { signedSerializedPSBT };
  } catch (err) {
    captureError(err);
  }
};
