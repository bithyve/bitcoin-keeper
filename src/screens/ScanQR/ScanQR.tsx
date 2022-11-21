import { ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { Box, HStack, Text } from 'native-base';
import React, { useEffect, useState } from 'react';

import HeaderTitle from 'src/components/HeaderTitle';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { URDecoder } from '@ngraveio/bc-ur';
import { decodeQRBytes } from 'src/core/services/qr';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('screen');
let decoder = new URDecoder();
const ScanQR = () => {
  const [qrPercent, setQrPercent] = useState(0);
  const [qrData, setData] = useState(0);
  const route = useRoute();
  const { title = '', subtitle = '', onQrScan = () => {} } = route.params as any;

  useEffect(() => {
    if (qrData) {
      console.log({ qrData });
      onQrScan(qrData);
    }
    return () => {
      decoder = new URDecoder();
    };
  }, [qrData]);

  const onBarCodeRead = (data) => {
    if (!qrData) {
      const { data: qrInfo, percentage } = decodeQRBytes(decoder, data.data);
      if (qrInfo) {
        setData(qrInfo);
      }
      setQrPercent(percentage);
    }
  };
  return (
    <ScreenWrapper>
      <HeaderTitle title={title} subtitle={subtitle} />
      <Box style={styles.qrcontainer}>
        <RNCamera style={styles.cameraView} captureAudio={false} onBarCodeRead={onBarCodeRead} />
      </Box>
      <HStack>
        {qrPercent !== 100 && <ActivityIndicator />}
        <Text>{`Scanned ${qrPercent}%`}</Text>
      </HStack>
    </ScreenWrapper>
  );
};

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
});
