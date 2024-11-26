import * as bitcoinJS from 'bitcoinjs-lib';
import { SigningPayload } from 'src/services/wallets/interfaces';
import config from 'src/utils/service-utilities/config';

const bscript = require('bitcoinjs-lib/src/script');

export const signWithLedgerChannel = (serializedPSBT, signingPayload: SigningPayload[], result) => {
  const psbtv0 = bitcoinJS.Psbt.fromBase64(serializedPSBT, { network: config.NETWORK });
  const signedData = result.map((input) => ({
    inputIndex: input[0], // the index of the input being signed.
    pubkeySecret: Buffer.from(input[1].pubkey), // a Buffer with either a 33-byte compressed pubkey or a 32-byte x-only pubkey whose corresponding secret key was used to sign.
    signature: Buffer.from(input[1].signature), // a Buffer with the corresponding signature.
  }));
  // construct signed PSBT from the corresponding signatures of the inputs
  const { inputsToSign } = signingPayload[0];
  for (let inputIndex = 0; inputIndex < inputsToSign.length; inputIndex += 1) {
    const { sighashType, publicKey } = inputsToSign[inputIndex];
    const { signature: derSignature } = signedData[inputIndex];
    const { signature } = bscript.signature.decode(derSignature); // re-encode from der to 64 byte
    psbtv0.addSignedDigest(
      signedData[inputIndex].inputIndex,
      Buffer.from(publicKey, 'hex'),
      signature,
      sighashType
    );
  }
  const signedSerializedPSBT = psbtv0.toBase64();
  return { signedSerializedPSBT };
};
