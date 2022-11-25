import { encodeBytesUR, encodePsbtUR } from 'src/core/services/qr';
import { useCallback, useEffect, useState } from 'react';

const useDynamicQrContent = ({
  data,
  toBytes = true,
  type = 'hex',
  rotation = 200,
  shouldRotate = true,
}: {
  data: any;
  toBytes?: boolean;
  type?: BufferEncoding;
  rotation?: number;
  shouldRotate?: boolean;
}) => {
  const [fragments, setFragments] = useState(0);
  const qrSet = toBytes ? encodeBytesUR(data, rotation, type) : encodePsbtUR(data, rotation);
  const mod = qrSet.length;

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
  const qrData = qrSet[fragments % mod];
  return { qrData };
};

export default useDynamicQrContent;
