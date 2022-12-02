import QRCode from 'react-native-qrcode-svg';
import React from 'react';
import useDynamicQrContent from 'src/hooks/useDynamicQrContent';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

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
  return <QRCode value={qrData} size={width * 0.85} ecl={'L'} />;
};

export default DisplayQR;
