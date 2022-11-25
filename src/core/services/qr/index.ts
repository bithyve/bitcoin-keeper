import { Bytes, CryptoPSBT, URRegistryDecoder } from '@keystonehq/bc-ur-registry/dist';

import { Psbt } from 'bitcoinjs-lib';
import { captureError } from '../sentry';

export const decodeURBytes = (decoder: URRegistryDecoder, bytes) => {
  try {
    // Create the decoder object
    decoder.receivePart(bytes);
    const scanPercentage = Math.floor(decoder.estimatedPercentComplete() * 100);
    if (decoder.isComplete()) {
      const ur = decoder.resultUR();
      // Decode the CBOR message to a Buffer
      if (ur.type === 'crypto-psbt') {
        const cryptoPsbt = CryptoPSBT.fromCBOR(ur.cbor);
        return { data: cryptoPsbt.getPSBT().toString('base64'), percentage: scanPercentage };
      }
      const decoded = ur.decodeCBOR();
      // get the original message, assuming it was a JSON object
      const data = JSON.parse(decoded.toString());
      return { data, percentage: scanPercentage };
    } else {
      return { data: null, percentage: scanPercentage };
    }
  } catch (error) {
    captureError(error);
  }
};

export const encodePsbtUR = (data, rotation) => {
  //check for psbt
  try {
    Psbt.fromBase64(data); // will throw if not psbt
    const buff = Buffer.from(data, 'base64');
    const cryptoPSBT = new CryptoPSBT(buff);
    const encoder = cryptoPSBT.toUREncoder(rotation);
    return getFragmentedData(encoder);
  } catch (_) {}
};
export const encodeBytesUR = (data, rotation, type: BufferEncoding = 'hex') => {
  //check for simple bytes
  try {
    const buff = Buffer.from(data, type);
    const bytes = new Bytes(buff);
    const encoder = bytes.toUREncoder(rotation);
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
