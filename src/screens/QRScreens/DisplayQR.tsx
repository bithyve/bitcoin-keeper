import React, { useState } from 'react';
import useDynamicQrContent from 'src/hooks/useDynamicQrContent';
import { BufferEncoding } from 'src/models/enums/BufferEncoding';
import { VStack, Slider, useColorMode } from 'native-base';
import { windowWidth, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import KeeperQRCode from 'src/components/KeeperQRCode';

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
      <KeeperQRCode qrData={qrData} size={windowWidth * 0.7} ecl="L" />
      <Slider
        marginTop={5}
        marginBottom={2}
        width={windowWidth * 0.5}
        defaultValue={100}
        minValue={10}
        maxValue={200}
        step={1}
        onChange={setRotation}
      >
        <Slider.Track bg={`${colorMode}.sliderUnfilled`}>
          <Slider.FilledTrack bg={`${colorMode}.pantoneGreen`} />
        </Slider.Track>
        <Slider.Thumb bg={`${colorMode}.pantoneGreen`} />
      </Slider>
      <Text color={`${colorMode}.secondaryText`}>Please rescan if the QR density is changed</Text>
    </VStack>
  );
}

export default DisplayQR;
