import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, HStack, VStack, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { QRreader } from 'react-native-qr-decode-image-camera';

import KeeperHeader from 'src/components/KeeperHeader';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { URRegistryDecoder } from 'src/services/qr/bc-ur-registry';
import { decodeURBytes } from 'src/services/qr';
import { useRoute } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker';
import useToastMessage from 'src/hooks/useToastMessage';
import UploadImage from 'src/components/UploadImage';
import { windowWidth } from 'src/constants/responsive';
import CameraUnauthorized from 'src/components/CameraUnauthorized';

import useNfcModal from 'src/hooks/useNfcModal';
import { globalStyles } from 'src/constants/globalStyles';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import NFCOption from '../NFCChannel/NFCOption';

let decoder = new URRegistryDecoder();

function ScanQR() {
  const { colorMode } = useColorMode();
  const [qrPercent, setQrPercent] = useState(0);
  const [qrData, setData] = useState(0);
  const route = useRoute();
  const { showToast } = useToastMessage();
  const {
    title = '',
    subtitle = '',
    onQrScan = () => {},
    setup = false,
    type,
    isHealthcheck = false,
    signer,
    disableMockFlow = false,
  } = route.params as any;

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const { nfcVisible, closeNfc, withNfcModal } = useNfcModal();
  // eslint-disable-next-line no-promise-executor-return
  const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const resetQR = async () => {
    await sleep(3000);
    setData(0);
    setQrPercent(0);
  };

  useEffect(() => {
    if (qrData) {
      if (isHealthcheck) {
        onQrScan(qrData, resetQR, signer);
      } else {
        onQrScan(qrData, resetQR);
      }
    }
    return () => {
      decoder = new URRegistryDecoder();
    };
  }, [qrData]);

  const onBarCodeRead = (data) => {
    if (!qrData && data.data) {
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
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <MockWrapper signerType={type} enable={setup && type && !disableMockFlow}>
        <>
          <KeeperHeader title={title} subtitle={subtitle} />
          <VStack style={globalStyles.centerColumn}>
            <Box style={styles.qrcontainer}>
              {!nfcVisible ? (
                <RNCamera
                  autoFocus="on"
                  style={styles.cameraView}
                  captureAudio={false}
                  onBarCodeRead={onBarCodeRead}
                  useNativeZoom
                  notAuthorizedView={<CameraUnauthorized />}
                />
              ) : (
                <Box style={styles.cameraView} />
              )}
            </Box>
            <UploadImage onPress={handleChooseImage} />
            <HStack>
              {qrPercent !== 100 && <ActivityIndicator />}
              <Text>{`Scanned ${qrPercent}%`}</Text>
            </HStack>
          </VStack>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            <NFCOption
              signerType={type}
              nfcVisible={nfcVisible}
              closeNfc={closeNfc}
              withNfcModal={withNfcModal}
              setData={setData}
            />
          </ScrollView>
          <Box style={styles.noteWrapper}>
            <Note
              title={common.note}
              subtitle="Make sure that the QR is well aligned, focused and visible as a whole"
              subtitleColor="GreyText"
            />
          </Box>
        </>
      </MockWrapper>
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
    height: windowWidth * 0.7,
    width: windowWidth * 0.8,
  },
  noteWrapper: {
    marginHorizontal: '5%',
  },
  scrollContainer: {
    alignItems: 'center',
  },
});
