import { ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { Box, HStack, Text } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';

import HeaderTitle from 'src/components/HeaderTitle';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { URRegistryDecoder } from 'src/core/services/qr/bc-ur-registry';
import { decodeURBytes } from 'src/core/services/qr';
import { useRoute } from '@react-navigation/native';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';

const { width } = Dimensions.get('screen');
let decoder = new URRegistryDecoder();
function ScanQR() {
  const [qrPercent, setQrPercent] = useState(0);
  const [qrData, setData] = useState(0);
  const route = useRoute();
  const { title = '', subtitle = '', onQrScan = () => {} } = route.params as any;

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  // eslint-disable-next-line no-promise-executor-return
  const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const resetQR = async () => {
    await sleep(3000);
    setData(0);
    setQrPercent(0);
  };

  useEffect(() => {
    if (qrData) {
      onQrScan(qrData, resetQR);
    }
    return () => {
      decoder = new URRegistryDecoder();
    };
  }, [qrData]);

  const onBarCodeRead = (data) => {
    if (!qrData) {
      if (!data.data.startsWith('UR') && !data.data.startsWith('ur')) {
        setData(data.data);
        setQrPercent(100);
      } else {
        const { data: qrInfo, percentage } = decodeURBytes(decoder, data.data);
        if (qrInfo) {
          setData(qrInfo);
        }
        setQrPercent(percentage);
      }
    }
  };
  return (
    <ScreenWrapper>
      <HeaderTitle
        title={title === 'Setting up SEEDSIGNER' ? 'Setting up SeedSigner' : title}
        subtitle={subtitle}
      />
      <Box style={styles.qrcontainer}>
        <RNCamera style={styles.cameraView} captureAudio={false} onBarCodeRead={onBarCodeRead} />
      </Box>
      <HStack>
        {qrPercent !== 100 && <ActivityIndicator />}
        <Text>{`Scanned ${qrPercent}%`}</Text>
      </HStack>
      <Box style={styles.noteWrapper}>
        <Note
          title={common.note}
          subtitle="Make sure that the QR is well aligned, focused and visible as a whole"
          subtitleColor="GreyText"
        />
      </Box>
    </ScreenWrapper>
  );
}

export default ScanQR;

const styles = StyleSheet.create({
  qrcontainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 25,
    alignItems: 'center',
  },
  cameraView: {
    height: width * 0.9,
    width: width * 0.9,
  },
  noteWrapper: {
    width: '100%',
    bottom: 0,
    position: 'absolute',
    padding: 20,
  },
});
