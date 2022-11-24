import QRCode from 'react-native-qrcode-svg';
import React from 'react';
import useDynamicQrContent from 'src/hooks/useDynamicQrContent';

const DisplayQR = ({
  qrContents,
  toBytes,
  type,
  rotation,
  shouldRotate,
}: {
  qrContents: any;
  toBytes?: boolean;
  type?: BufferEncoding;
  rotation?: number;
  shouldRotate?: boolean;
}) => {
  const { qrData } = useDynamicQrContent({
    data: qrContents,
    toBytes,
    type,
    rotation,
    shouldRotate,
  });
  return <QRCode value={qrData} size={350} ecl={'L'} />;
};

export default DisplayQR;
