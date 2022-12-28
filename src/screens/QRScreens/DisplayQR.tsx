import QRCode from 'react-native-qrcode-svg';
import React from 'react';
import useDynamicQrContent from 'src/hooks/useDynamicQrContent';
import { Dimensions } from 'react-native';
import { BufferEncoding } from 'src/common/data/enums/BufferEncoding';

const { width } = Dimensions.get('window');

DisplayQR.defaultProps = {
  toBytes: true,
  type: 'hex',
  rotation: 200,
  shouldRotate: true,
};

function DisplayQR({
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
}) {
  const { qrData } = useDynamicQrContent({
    data: qrContents,
    toBytes,
    type,
    rotation,
    shouldRotate,
  });
  return <QRCode value={qrData} size={width * 0.85} ecl="L" />;
}

export default DisplayQR;
