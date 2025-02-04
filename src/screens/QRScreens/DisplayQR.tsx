import React, { useEffect, useState } from 'react';
import useDynamicQrContent from 'src/hooks/useDynamicQrContent';
import { BufferEncoding } from 'src/models/enums/BufferEncoding';
import { VStack, Slider, useColorMode } from 'native-base';
import { windowWidth, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import KeeperQRCode from 'src/components/KeeperQRCode';

import { SignerType } from 'src/services/wallets/enums';
import { interpolateBBQR, psbtToBBQR } from 'src/utils/utilities';

DisplayQR.defaultProps = {
  toBytes: true,
  type: 'hex',
  shouldRotate: true,
  signerType: null,
};

function DisplayQR({
  qrContents,
  toBytes,
  type,
  shouldRotate,
  signerType,
}: {
  qrContents: any;
  toBytes?: boolean;
  type?: BufferEncoding;
  shouldRotate?: boolean;
  signerType?: string;
}) {
  const isColdCard = signerType === SignerType.COLDCARD;
  const { colorMode } = useColorMode();
  const [rotation, setRotation] = useState(100);
  const [coldCardQrData, setColdCardQrData] = useState(null);
  const { qrData } = useDynamicQrContent({
    data: isColdCard ? coldCardQrData : qrContents,
    toBytes,
    type,
    rotation,
    shouldRotate,
    showBBQR: isColdCard,
  });

  useEffect(() => {
    if (isColdCard) loadBBQR();
  }, [rotation]);

  const loadBBQR = async () => {
    const val = interpolateBBQR(rotation);
    for (let i = val; i > 0; i--) {
      try {
        const data = await psbtToBBQR(qrContents, i);
        if (data && data.length > 0 && data[0]) {
          setColdCardQrData(data);
          break;
        }
      } catch {
        console.log('Failed to generate BBQr');
      }
    }
  };

  return (
    <>
      {(qrData?.length || coldCardQrData?.length) && (
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
          <Text color={`${colorMode}.secondaryText`}>
            Please rescan if the QR density is changed
          </Text>
        </VStack>
      )}
    </>
  );
}

export default DisplayQR;
