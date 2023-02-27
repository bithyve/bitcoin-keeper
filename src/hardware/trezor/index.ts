/* eslint-disable no-await-in-loop */
import { DerivationPurpose, XpubTypes } from 'src/core/wallets/enums';
import { Vault, VaultSigner, XpubDetailsType } from 'src/core/wallets/interfaces/vault';
import { HWErrorType } from 'src/common/data/enums/Hardware';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';
import { captureError } from 'src/core/services/sentry';
import * as bitcoinJS from 'bitcoinjs-lib';
import { SigningPayload } from 'src/core/wallets/interfaces';
import reverse from 'buffer-reverse';
import HWError from '../HWErrorState';
import { getKeypathFromString } from '..';

export const getTrezorDetails = (data, isMultisig) => {
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

export const getTxForTrezor = (
  serializedPSBT: string,
  signingPayload: SigningPayload[],
  signer: VaultSigner,
  vault: Vault
) => {
  try {
    const payload = signingPayload[0];
    const psbt = bitcoinJS.Psbt.fromBase64(serializedPSBT, {
      network: WalletUtilities.getNetworkByType(config.NETWORK_TYPE),
    });
    const { inputs: inputUtxos, change: changeAddress, inputsToSign } = payload;
    const keypathAccount = getKeypathFromString(signer.derivationPath);
    const inputs = psbt.txInputs.map((input, index) => {
      const { subPath } = inputsToSign[index];
      const [, c, a] = subPath.split('/');
      return {
        prev_hash: getIdFromHash(input.hash),
        prev_index: input.index,
        amount: inputUtxos[index].value,
        address_n: keypathAccount.concat([Number(c), Number(a)]),
        script_type: getInputScriptCodesFromPath(signer.derivationPath),
        sequence: input.sequence,
      };
    });
    const outputs = psbt.txOutputs.map((output) => {
      const isChangeOutput = output.address === changeAddress;
      return isChangeOutput
        ? {
            address_n: keypathAccount.concat([1, vault.specs.nextFreeChangeAddressIndex]),
            amount: output.value,
            script_type: getOutputScriptCodesFromPath(signer.derivationPath),
          }
        : {
            address: output.address,
            amount: output.value,
            script_type: 'PAYTOADDRESS',
          };
    });
    return { inputs, outputs };
  } catch (_) {
    captureError(_);
    return serializedPSBT;
  }
};

export const getSignedSerializedPSBTForTrezor = (unsignedPSBT, signedTx, signingPayload) => {
  try {
    const { signatures, witnesses } = signedTx;
    const PSBT = bitcoinJS.Psbt.fromBase64(unsignedPSBT);
    const { inputsToSign } = signingPayload[0];
    for (let inputIndex = 0; inputIndex < inputsToSign.length; inputIndex += 1) {
      const { sighashType, publicKey } = inputsToSign[inputIndex];
      const derSignature = Buffer.from(signatures[inputIndex], 'hex');
      const hashTypeBuffer = Buffer.allocUnsafe(1);
      hashTypeBuffer.writeUInt8(sighashType, 0);
      PSBT.data.updateInput(inputIndex, {
        partialSig: [
          {
            pubkey: Buffer.from(publicKey, 'hex'),
            signature: Buffer.concat([derSignature, hashTypeBuffer]),
          },
        ],
        witnessScript: Buffer.from(witnesses[inputIndex], 'hex'),
      });
    }
    return { signedSerializedPSBT: PSBT.toBase64() };
  } catch (err) {
    captureError(err);
  }
};

const getIdFromHash = (hash: Buffer): string => reverse(hash).toString('hex');

const getOutputScriptCodesFromPath = (path) => {
  const purpose = WalletUtilities.getPurpose(path);
  switch (purpose) {
    case DerivationPurpose.BIP48:
      return 'PAYTOMULTISIG';
    case DerivationPurpose.BIP49:
      return 'PAYTOP2SHWITNESS';
    case DerivationPurpose.BIP84:
      return 'PAYTOWITNESS';
    case DerivationPurpose.BIP86:
      return 'PAYTOTAPROOT';
    default:
      return 'PAYTOADDRESS';
  }
};

const getInputScriptCodesFromPath = (path) => {
  const purpose = WalletUtilities.getPurpose(path);
  switch (purpose) {
    case DerivationPurpose.BIP48:
      return 'SPENDMULTISIG';
    case DerivationPurpose.BIP49:
      return 'SPENDP2SHWITNESS';
    case DerivationPurpose.BIP84:
      return 'SPENDWITNESS';
    case DerivationPurpose.BIP86:
      return 'SPENDTAPROOT';
    default:
      return 'SPENDADDRESS';
  }
};
