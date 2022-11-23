import { useCallback, useEffect, useState } from 'react';

import { Bytes } from '@keystonehq/bc-ur-registry/dist';

const encodeUR = (data, rotation) => {
  const bytes = new Bytes(Buffer.from(data, 'hex'));
  const encoder = bytes.toUREncoder(rotation);
  const fragments = [];
  for (let c = 1; c <= encoder.fragmentsLength; c++) {
    const ur = encoder.nextPart();
    fragments.push(ur);
  }
  return fragments;
};

const useDynamicQrContent = ({ data, rotation = 200, shouldRotate = true }) => {
  const [fragments, setFragments] = useState(0);
  const qrSet = encodeUR(data, rotation);
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
