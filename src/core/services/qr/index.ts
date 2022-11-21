import { URDecoder } from '@ngraveio/bc-ur';

export const decodeQRBytes = (decoder: URDecoder, bytes) => {
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
    console.warn(error);
  }
};
