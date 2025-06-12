import React, { useContext, useEffect, useState } from 'react';
import useDynamicQrContent from 'src/hooks/useDynamicQrContent';
import { BufferEncoding } from 'src/models/enums/BufferEncoding';
import { VStack, Slider, useColorMode } from 'native-base';
import { windowWidth, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import KeeperQRCode from 'src/components/KeeperQRCode';

import { SignerType } from 'src/services/wallets/enums';
import { interpolateBBQR, psbtToBBQR } from 'src/utils/utilities';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function DisplayQR({
  qrContents,
  toBytes = true,
  type = 'hex',
  shouldRotate = true,
  signerType = null,
  size = windowWidth * 0.7,
}: {
  qrContents: any;
  toBytes?: boolean;
  type?: BufferEncoding;
  shouldRotate?: boolean;
  signerType?: string;
  size: number;
}) {
  const isColdCard = signerType === SignerType.COLDCARD;
  const { colorMode } = useColorMode();
  const [rotation, setRotation] = useState(100);
  const [coldCardQrData, setColdCardQrData] = useState(null);
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletText } = translations;
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
          <KeeperQRCode qrData={qrData} size={size} ecl="L" />
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
          <Text color={`${colorMode}.secondaryText`}>{walletText.rescanQrDensity}</Text>
        </VStack>
      )}
    </>
  );
}

export default DisplayQR;
