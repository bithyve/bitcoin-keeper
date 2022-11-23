import { Bytes, URRegistryDecoder } from '@keystonehq/bc-ur-registry/dist';

import { captureError } from '../sentry';

export const decodeURBytes = (decoder: URRegistryDecoder, bytes) => {
  try {
    // Create the decoder object
    decoder.receivePart(bytes);
    const scanPercentage = Math.floor(decoder.estimatedPercentComplete() * 100);
    if (decoder.isComplete()) {
      const ur = decoder.resultUR();
      // Decode the CBOR message to a Buffer
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

export const encodeUR = (data, rotation) => {
  const bytes = new Bytes(Buffer.from(data, 'hex'));
  const encoder = bytes.toUREncoder(rotation);
  const fragments = [];
  for (let c = 1; c <= encoder.fragmentsLength; c++) {
    const ur = encoder.nextPart();
    fragments.push(ur);
  }
  return fragments;
};
