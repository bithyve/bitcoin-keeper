import QRCode from 'react-native-qrcode-svg';
import React, { useState } from 'react';
import useDynamicQrContent from 'src/hooks/useDynamicQrContent';
import { BufferEncoding } from 'src/models/enums/BufferEncoding';
import { VStack, Slider, useColorMode } from 'native-base';
import { windowWidth, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';

DisplayQR.defaultProps = {
  toBytes: true,
  type: 'hex',
  shouldRotate: true,
};

function DisplayQR({
  qrContents,
  toBytes,
  type,
  shouldRotate,
}: {
  qrContents: any;
  toBytes?: boolean;
  type?: BufferEncoding;
  shouldRotate?: boolean;
}) {
  const { colorMode } = useColorMode();
  const [rotation, setRotation] = useState(100);
  const { qrData } = useDynamicQrContent({
    data: qrContents,
    toBytes,
    type,
    rotation,
    shouldRotate,
  });
  return (
    <VStack alignItems="center">
      <QRCode value={qrData} size={wp(255)} ecl="L" />
      <Slider
        marginTop={5}
        width={windowWidth * 0.5}
        defaultValue={100}
        minValue={10}
        maxValue={200}
        step={1}
        onChange={setRotation}
      >
        <Slider.Track bg="gray.300">
          <Slider.FilledTrack bg={`${colorMode}.primaryGreen`} />
        </Slider.Track>
        <Slider.Thumb bg={`${colorMode}.primaryGreen`} />
      </Slider>
      <Text color={`${colorMode}.secondaryText`}>Please rescan if the QR density is changed</Text>
    </VStack>
  );
}

export default DisplayQR;
