import { Box, HStack, useColorMode, VStack } from 'native-base';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';
import CameraUnauthorized from './CameraUnauthorized';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { URRegistryDecoder } from 'src/services/qr/bc-ur-registry';
import { decodeURBytes } from 'src/services/qr';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import UploadImage from './UploadImage';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker';
import { QRreader } from 'react-native-qr-decode-image-camera';
import useToastMessage from 'src/hooks/useToastMessage';
import Text from './KeeperText';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { joinQRs } from 'src/services/qr/bbqr/join';
import { extractBBQRIndex, isHexadecimal } from 'src/utils/utilities';
import { Psbt } from 'bitcoinjs-lib';

let decoder = new URRegistryDecoder();

function QRScanner({
  onScanCompleted,
  hideCamera = false,
}: {
  onScanCompleted: (data) => void;
  hideCamera?: boolean;
}) {
  const { colorMode } = useColorMode();

  const [isFocused, setIsFocused] = useState(false);
  const [qrPercent, setQrPercent] = useState(0);
  const [qrData, setData] = useState(0);
  const [hasError, setHasError] = useState(false);
  const bbqrArray = useRef([]);

  const { showToast } = useToastMessage();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  // eslint-disable-next-line no-promise-executor-return
  const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const resetQR = useCallback(
    async (error = false) => {
      await sleep(500);
      setData(0);
      setQrPercent(0);
      if (error || hasError) {
        showToast('Invalid QR Scanned', <ToastErrorIcon />);
        decoder = new URRegistryDecoder();
        await sleep(3000);
      }
      setHasError(false);
    },
    [hasError]
  );

  useEffect(() => {
    if (qrData) {
      onScanCompleted(qrData);
      resetQR();
    }
    return () => {
      decoder = new URRegistryDecoder();
    };
  }, [qrData]);

  const onBarCodeRead = useCallback(
    (data) => {
      if (!qrData && !hasError) {
        if (data.data.startsWith('B$')) {
          try {
            if (bbqrArray.current.length > 0 && bbqrArray.current.every((item) => item !== null))
              return;
            const { total, index } = extractBBQRIndex(data.data);
            if (!bbqrArray.current.length) {
              bbqrArray.current = Array(total).fill(null);
              bbqrArray.current[index] = data.data;
              setQrPercent(Math.round((1 / total) * 100));
            } else {
              if (!bbqrArray.current[index]) {
                bbqrArray.current[index] = data.data;
                setQrPercent(
                  Math.round(
                    (bbqrArray.current.filter((item) => item !== null).length / total) * 100
                  )
                );
              }
              if (bbqrArray.current.every((item) => item !== null)) {
                setQrPercent(100);
                const reassembled = joinQRs(bbqrArray.current);
                try {
                  const decoder = new TextDecoder('utf-8');
                  const jsonString = decoder.decode(reassembled.raw);

                  const jsonData = JSON.parse(jsonString);
                  setData(jsonData);
                } catch {
                  // Should be a PSBT
                  setData(Buffer.from(reassembled.raw).toString('base64'));
                }
              }
            }
          } catch (error) {
            console.log('🚀 ~ error:', error);
            setHasError(true);
            resetQR(true);
          }
        } else {
          if (!data.data.startsWith('UR') && !data.data.startsWith('ur')) {
            if (isHexadecimal(data.data)) {
              // for hex response from coldcardQ
              const binaryData = Buffer.from(data.data, 'hex');
              try {
                if (Psbt.fromBase64(binaryData.toString('base64'))) {
                  setData(binaryData.toString('base64'));
                } else {
                  setData(data.data);
                }
              } catch {
                setData(data.data);
              }

              setQrPercent(100);
            } else {
              setData(data.data);
              setQrPercent(100);
            }
          } else {
            try {
              const { data: qrInfo, percentage } = decodeURBytes(decoder, data.data);
              if (qrInfo) {
                setData(qrInfo);
              }
              setQrPercent(percentage);
            } catch {
              setHasError(true);
              resetQR(true);
            }
          }
        }
      }
    },
    [qrData, hasError]
  );

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
    <Box>
      <VStack style={styles.centerColumn}>
        <Box style={styles.qrcontainer}>
          {hideCamera || isFocused ? (
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
        <Box style={[styles.uploadButton, { top: windowWidth * 0.7 - 25 }]}>
          <UploadImage backgroundColor={`${colorMode}.BrownNeedHelp`} onPress={handleChooseImage} />
        </Box>
      </VStack>

      <HStack justifyContent="center" my={2}>
        {qrPercent !== 0 && qrPercent !== 100 && (
          <Box flexDirection={'row'}>
            <ActivityIndicator />
            <Text style={{ marginLeft: wp(7) }}>{`Scanned ${qrPercent}%`}</Text>
          </Box>
        )}
      </HStack>
    </Box>
  );
}

export default QRScanner;

const styles = StyleSheet.create({
  qrcontainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 15,
    alignItems: 'center',
  },
  centerColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  cameraView: {
    height: windowWidth * 0.7,
    width: windowWidth * 0.8,
  },
  uploadButton: {
    position: 'absolute',
    zIndex: 999,
    justifyContent: 'center',
    maxHeight: hp(35),
  },
});
