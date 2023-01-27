import { ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, HStack } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { QRreader } from 'react-native-qr-decode-image-camera';
import HeaderTitle from 'src/components/HeaderTitle';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { URRegistryDecoder } from 'src/core/services/qr/bc-ur-registry';
import { decodeURBytes } from 'src/core/services/qr';
import { useRoute } from '@react-navigation/native';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker';
import useToastMessage from 'src/hooks/useToastMessage';
import UploadImage from 'src/components/UploadImage';
import MockWrapper from '../Vault/MockWrapper';

const { width } = Dimensions.get('screen');
let decoder = new URRegistryDecoder();

function QrRecovery() {
  const [qrPercent, setQrPercent] = useState(0);
  const [qrData, setData] = useState(0);
  const route = useRoute();
  const { showToast } = useToastMessage();
  const {
    title = '',
    subtitle = '',
    onQrScan = () => {},
    setup = true,
    type,
  } = route.params as any;

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

  const handleChooseImage = () => {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: { skipBackup: true },
      mediaType: 'photo',
    } as ImageLibraryOptions;

    launchImageLibrary(options, async (response) => {
      try {
        if (response.didCancel) {
          // ignore if user canceled the process
        } else if (response.errorCode === 'camera_unavailable') {
          showToast('Camera not available on device');
        } else if (response.errorCode === 'permission') {
          showToast('Permission not satisfied');
        } else if (response.errorCode === 'others') {
          showToast(response.errorMessage);
        } else {
          const data = await QRreader(response.assets[0].uri);
          onBarCodeRead({ data });
        }
      } catch (_) {
        showToast('Invalid or No related QR code');
      }
    });
  };

  return (
    <ScreenWrapper>
      <MockWrapper signerType={type} enable={setup && type} isRecovery>
        <Box flex={1}>
          <HeaderTitle title={title} subtitle={subtitle} />
          <Box style={styles.qrcontainer}>
            <RNCamera
              style={styles.cameraView}
              captureAudio={false}
              onBarCodeRead={onBarCodeRead}
              useNativeZoom
            />
          </Box>
          <UploadImage onPress={handleChooseImage} />
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
        </Box>
      </MockWrapper>
    </ScreenWrapper>
  );
}
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

export default QrRecovery;
