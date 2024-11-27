import {
  Bytes,
  CryptoAccount,
  CryptoPSBT,
  CryptoOutput,
  URRegistryDecoder,
} from 'src/services/qr/bc-ur-registry';

import { Psbt } from 'bitcoinjs-lib';
import WalletUtilities from 'src/services/wallets/operations/utils';

export const decodeURBytes = (decoder: URRegistryDecoder, bytes) => {
  let scanPercentage;
  // Create the decoder object
  decoder.receivePart(bytes);
  scanPercentage = Math.floor(decoder.estimatedPercentComplete() * 100);
  if (decoder.isComplete()) {
    const ur = decoder.resultUR();
    if (ur.type === 'crypto-account') {
      const cryptoAccount = CryptoAccount.fromCBOR(ur.cbor);
      const { xPub, derivationPath, mfp } = WalletUtilities.generateXpubFromMetaData(cryptoAccount);
      return {
        data: {
          mfp,
          derivationPath,
          xPub,
        },
        percentage: scanPercentage,
      };
    }
    // Decode the CBOR message to a Buffer
    if (ur.type === 'crypto-psbt') {
      const cryptoPsbt = CryptoPSBT.fromCBOR(ur.cbor);
      return { data: cryptoPsbt.getPSBT().toString('base64'), percentage: scanPercentage };
    }

    if (ur.type === 'crypto-output') {
      const cryptOutput = CryptoOutput.fromCBOR(ur.cbor);
      return { data: cryptOutput.toString(), percentage: scanPercentage };
    }

    if (ur.type === 'bytes') {
      const result = decoder.resultUR();
      const decoded = result.decodeCBOR();
      const decodedString = decoded.toString();
      if (decodedString.includes('BSMS')) {
        return { data: decodedString, percentage: scanPercentage };
      } else if (decodedString.startsWith('psbt') || decodedString.startsWith('PSBT')) {
        const cryptoPsbt = CryptoPSBT.fromCBOR(ur.cbor);
        return { data: cryptoPsbt.getPSBT().toString('base64'), percentage: scanPercentage };
      }
    }

    const decoded = ur.decodeCBOR();
    // get the original message, assuming it was a JSON object
    const data = JSON.parse(decoded.toString());
    return { data, percentage: scanPercentage };
  }
  return { data: null, percentage: scanPercentage };
};

export const encodePsbtUR = (data, rotation) => {
  // check for psbt
  try {
    Psbt.fromBase64(data); // will throw if not psbt
    const buff = Buffer.from(data, 'base64');
    const cryptoPSBT = new CryptoPSBT(buff);
    const encoder = cryptoPSBT.toUREncoder(rotation);
    return getFragmentedData(encoder);
  } catch (_) {}
};
export const encodeBytesUR = (data, rotation, type: BufferEncoding = 'hex') => {
  // check for simple bytes
  try {
    const buff = Buffer.from(data, type);
    const bytes = new Bytes(buff);
    const encoder = bytes.toUREncoder(rotation, null, rotation);
    return getFragmentedData(encoder);
  } catch (_) {}
  return [data];
};

const getFragmentedData = (encoder) => {
  const fragments = [];
  for (let c = 1; c <= encoder.fragmentsLength; c++) {
    const ur = encoder.nextPart();
    fragments.push(ur);
  }
  return fragments;
};
