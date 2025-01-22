import { encodeBytesUR, encodePsbtUR } from 'src/services/qr';
import { useCallback, useEffect, useState } from 'react';
import { BufferEncoding } from 'src/models/enums/BufferEncoding';

const useDynamicQrContent = ({
  data,
  toBytes = true,
  type = 'hex',
  rotation = 200,
  shouldRotate = true,
  showBBQR = false,
}: {
  data: any;
  toBytes?: boolean;
  type?: BufferEncoding;
  rotation?: number;
  shouldRotate?: boolean;
  showBBQR?: boolean;
}) => {
  const [fragments, setFragments] = useState(0);
  const qrSet = showBBQR
    ? data
    : toBytes
    ? encodeBytesUR(data, rotation, type)
    : encodePsbtUR(data, rotation);
  const mod = qrSet?.length;

  const startRotation = useCallback(() => {
    if (shouldRotate) {
      if (fragments === rotation - 1) {
        setFragments(0);
      } else {
        setFragments((prev) => prev + 1);
      }
    }
  }, [fragments]);

  useEffect(() => {
    const interval = setInterval(startRotation, 500);
    return () => clearInterval(interval);
  }, []);
  const qrData = mod ? qrSet[fragments % mod] : '';
  return { qrData };
};

export default useDynamicQrContent;
